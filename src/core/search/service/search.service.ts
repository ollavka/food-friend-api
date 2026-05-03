import { Injectable } from '@nestjs/common'
import {
  BackgroundJob,
  BackgroundJobStatus,
  BackgroundJobType,
  LanguageCode,
  Prisma,
  RecipeStatus,
  User,
} from '@prisma/client'
import { PaginationMeta, Uuid } from '@common/type'
import { isRecord, isUuid, randomHash, uuidToHash } from '@common/util'
import { NonRetryableBackgroundJobError } from '@core/background-job'
import { BackgroundJobApiModel } from '@core/background-job/api-model'
import { LanguageService } from '@core/language'
import { PrismaService } from '@infrastructure/database'
import { MeilisearchService } from '@infrastructure/meilisearch'
import {
  PaginatedSearchProductsApiModel,
  PaginatedSearchRecipesApiModel,
  SearchProductItemApiModel,
  SearchRecipeItemApiModel,
} from '../api-model'
import { SearchProductQueryDto, SearchRecipeQueryDto, SearchReindexDto, SearchReindexEntity } from '../dto'
import { SearchRepository } from '../repository'
import { SearchProductDocument, SearchRecipeDocument } from '../type'
import { buildLocalizedMap, normalizeStringArray, normalizeStringMap, pickLocalizedValue, uniqueValues } from '../util'

type SearchSyncAction = 'UPSERT' | 'DELETE'

type ProductSyncPayload = {
  productId: Uuid
  action: SearchSyncAction
}

type RecipeSyncPayload = {
  recipeId: Uuid
  action: SearchSyncAction
}

type ReindexPayload = {
  entity: SearchReindexEntity
}

@Injectable()
export class SearchService {
  private readonly productsIndexSettings = {
    searchableAttributes: ['slug', 'searchNames', 'searchDescriptions'],
    filterableAttributes: ['isSystem', 'measurementBaseTypeKey'],
    sortableAttributes: ['createdAtTs', 'updatedAtTs'],
  }

  private readonly recipesIndexSettings = {
    searchableAttributes: ['slug', 'searchTitles', 'searchDescriptions'],
    filterableAttributes: ['status', 'difficultyKey', 'cookingTimeMinutes'],
    sortableAttributes: ['createdAtTs', 'updatedAtTs', 'publishedAtTs', 'cookingTimeMinutes'],
  }

  public constructor(
    private readonly searchRepository: SearchRepository,
    private readonly languageService: LanguageService,
    private readonly meilisearchService: MeilisearchService,
    private readonly prismaService: PrismaService,
  ) {}

  public async searchProducts(
    query: SearchProductQueryDto,
    languageCode: LanguageCode,
  ): Promise<PaginatedSearchProductsApiModel> {
    await this.ensureIndexesConfigured()

    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const defaultLanguage = await this.languageService.getDefaultLanguage()
    const page = query.pagination?.page ?? 1
    const limit = query.pagination?.limit ?? 10

    const filterExpressions: string[] = []

    if (query.filter?.measurementBaseType) {
      filterExpressions.push(`measurementBaseTypeKey = "${this.escapeFilterValue(query.filter.measurementBaseType)}"`)
    }

    if (query.filter?.isSystem !== undefined) {
      filterExpressions.push(`isSystem = ${query.filter.isSystem}`)
    }

    const response = await this.meilisearchService.search(
      this.meilisearchService.productsIndexUid,
      query.filter?.search ?? '',
      {
        page,
        hitsPerPage: limit,
        ...(filterExpressions.length > 0 ? { filter: filterExpressions.join(' AND ') } : {}),
      },
    )

    const items = response.hits
      .map((hit) => this.parseProductDocument(hit))
      .filter((item): item is SearchProductDocument => !!item)
      .map((item) => ({
        id: item.id,
        slug: item.slug,
        name: pickLocalizedValue(item.namesByLanguage, language.code, defaultLanguage.code) ?? item.slug,
        description: pickLocalizedValue(item.descriptionsByLanguage, language.code, defaultLanguage.code),
        measurementBaseTypeKey: item.measurementBaseTypeKey,
        measurementUnitKey: item.measurementUnitKey,
        imageUrl: item.imageUrl,
        isSystem: item.isSystem,
      }))

    return {
      items: SearchProductItemApiModel.fromList(items),
      meta: this.buildPaginationMeta(page, limit, this.extractTotalItems(response, items.length)),
    }
  }

  public async searchRecipes(
    query: SearchRecipeQueryDto,
    languageCode: LanguageCode,
  ): Promise<PaginatedSearchRecipesApiModel> {
    await this.ensureIndexesConfigured()

    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const defaultLanguage = await this.languageService.getDefaultLanguage()
    const page = query.pagination?.page ?? 1
    const limit = query.pagination?.limit ?? 10
    const filterExpressions: string[] = [`status = "${RecipeStatus.PUBLISHED}"`]

    if (query.filter?.difficulty) {
      filterExpressions.push(`difficultyKey = "${this.escapeFilterValue(query.filter.difficulty)}"`)
    }

    if (query.filter?.maxCookingTimeMinutes !== undefined) {
      filterExpressions.push(`cookingTimeMinutes <= ${query.filter.maxCookingTimeMinutes}`)
    }

    const response = await this.meilisearchService.search(
      this.meilisearchService.recipesIndexUid,
      query.filter?.search ?? '',
      {
        page,
        hitsPerPage: limit,
        filter: filterExpressions.join(' AND '),
      },
    )

    const items = response.hits
      .map((hit) => this.parseRecipeDocument(hit))
      .filter((item): item is SearchRecipeDocument => !!item)
      .map((item) => ({
        id: item.id,
        slug: item.slug,
        status: item.status,
        title: pickLocalizedValue(item.titlesByLanguage, language.code, defaultLanguage.code) ?? item.slug,
        description: pickLocalizedValue(item.descriptionsByLanguage, language.code, defaultLanguage.code),
        imageUrl: item.imageUrl,
        difficultyKey: item.difficultyKey,
        difficultyLabel:
          pickLocalizedValue(item.difficultyLabelsByLanguage, language.code, defaultLanguage.code) ??
          item.difficultyKey,
        cookingTimeMinutes: item.cookingTimeMinutes,
        servings: item.servings,
        publishedAt: item.publishedAtTs ? new Date(item.publishedAtTs) : null,
        author: {
          id: item.authorId,
          firstName: item.authorFirstName,
          lastName: item.authorLastName,
        },
      }))

    return {
      items: SearchRecipeItemApiModel.fromList(items),
      meta: this.buildPaginationMeta(page, limit, this.extractTotalItems(response, items.length)),
    }
  }

  public async createReindexJobs(user: User, dto?: SearchReindexDto): Promise<BackgroundJobApiModel[]> {
    const targetEntities = [...new Set(dto?.entities ?? [SearchReindexEntity.PRODUCTS, SearchReindexEntity.RECIPES])]
    const jobsData = targetEntities.map((entity) => ({
      type:
        entity === SearchReindexEntity.PRODUCTS
          ? BackgroundJobType.SEARCH_REINDEX_PRODUCTS
          : BackgroundJobType.SEARCH_REINDEX_RECIPES,
      status: BackgroundJobStatus.PENDING,
      userId: user.id,
      dedupKey: `search-reindex:${entity}:${uuidToHash(user.id)}:${randomHash()}`,
      payload: {
        entity,
      },
    }))

    const createdJobs = await this.prismaService.backgroundJob.createManyAndReturn({
      data: jobsData,
    })

    return createdJobs.map((backgroundJob) => BackgroundJobApiModel.from(this.mapBackgroundJob(backgroundJob)))
  }

  public async handleSearchSyncProductJob(backgroundJob: BackgroundJob): Promise<Record<string, unknown>> {
    await this.ensureIndexesConfigured()

    const payload = this.parseProductSyncPayload(backgroundJob.payload)

    if (payload.action === 'DELETE') {
      await this.meilisearchService.deleteDocument(this.meilisearchService.productsIndexUid, payload.productId)

      return {
        type: BackgroundJobType.SEARCH_SYNC_PRODUCT,
        action: payload.action,
        productId: payload.productId,
      }
    }

    const products = await this.searchRepository.findProductsForIndexing([payload.productId])
    const product = products[0]

    if (!product) {
      await this.meilisearchService.deleteDocument(this.meilisearchService.productsIndexUid, payload.productId)

      return {
        type: BackgroundJobType.SEARCH_SYNC_PRODUCT,
        action: payload.action,
        productId: payload.productId,
        deletedMissing: true,
      }
    }

    await this.meilisearchService.upsertDocuments(this.meilisearchService.productsIndexUid, [
      this.mapProductToSearchDocument(product),
    ])

    return {
      type: BackgroundJobType.SEARCH_SYNC_PRODUCT,
      action: payload.action,
      productId: payload.productId,
      upserted: true,
    }
  }

  public async handleSearchSyncRecipeJob(backgroundJob: BackgroundJob): Promise<Record<string, unknown>> {
    await this.ensureIndexesConfigured()

    const payload = this.parseRecipeSyncPayload(backgroundJob.payload)

    if (payload.action === 'DELETE') {
      await this.meilisearchService.deleteDocument(this.meilisearchService.recipesIndexUid, payload.recipeId)

      return {
        type: BackgroundJobType.SEARCH_SYNC_RECIPE,
        action: payload.action,
        recipeId: payload.recipeId,
      }
    }

    const recipes = await this.searchRepository.findRecipesForIndexing([payload.recipeId])
    const recipe = recipes[0]

    if (!recipe || recipe.status !== RecipeStatus.PUBLISHED) {
      await this.meilisearchService.deleteDocument(this.meilisearchService.recipesIndexUid, payload.recipeId)

      return {
        type: BackgroundJobType.SEARCH_SYNC_RECIPE,
        action: payload.action,
        recipeId: payload.recipeId,
        deletedUnpublished: true,
      }
    }

    await this.meilisearchService.upsertDocuments(this.meilisearchService.recipesIndexUid, [
      this.mapRecipeToSearchDocument(recipe),
    ])

    return {
      type: BackgroundJobType.SEARCH_SYNC_RECIPE,
      action: payload.action,
      recipeId: payload.recipeId,
      upserted: true,
    }
  }

  public async handleSearchReindexProductsJob(backgroundJob: BackgroundJob): Promise<Record<string, unknown>> {
    await this.ensureIndexesConfigured()
    this.parseReindexPayload(backgroundJob.payload, SearchReindexEntity.PRODUCTS)

    const products = await this.searchRepository.findProductsForIndexing()
    const documents = products.map((product) => this.mapProductToSearchDocument(product))

    await this.meilisearchService.deleteAllDocuments(this.meilisearchService.productsIndexUid)
    await this.upsertInBatches(this.meilisearchService.productsIndexUid, documents)

    return {
      type: BackgroundJobType.SEARCH_REINDEX_PRODUCTS,
      indexedDocuments: documents.length,
    }
  }

  public async handleSearchReindexRecipesJob(backgroundJob: BackgroundJob): Promise<Record<string, unknown>> {
    await this.ensureIndexesConfigured()
    this.parseReindexPayload(backgroundJob.payload, SearchReindexEntity.RECIPES)

    const recipes = await this.searchRepository.findRecipesForIndexing()
    const documents = recipes
      .filter((recipe) => recipe.status === RecipeStatus.PUBLISHED)
      .map((recipe) => this.mapRecipeToSearchDocument(recipe))

    await this.meilisearchService.deleteAllDocuments(this.meilisearchService.recipesIndexUid)
    await this.upsertInBatches(this.meilisearchService.recipesIndexUid, documents)

    return {
      type: BackgroundJobType.SEARCH_REINDEX_RECIPES,
      indexedDocuments: documents.length,
    }
  }

  private async ensureIndexesConfigured(): Promise<void> {
    await Promise.all([
      this.meilisearchService.ensureIndex(this.meilisearchService.productsIndexUid, this.productsIndexSettings),
      this.meilisearchService.ensureIndex(this.meilisearchService.recipesIndexUid, this.recipesIndexSettings),
    ])
  }

  private async upsertInBatches(indexUid: string, documents: Array<Record<string, unknown>>): Promise<void> {
    const batchSize = 200

    for (let index = 0; index < documents.length; index += batchSize) {
      await this.meilisearchService.upsertDocuments(indexUid, documents.slice(index, index + batchSize))
    }
  }

  private mapProductToSearchDocument(
    product: Awaited<ReturnType<SearchRepository['findProductsForIndexing']>>[number],
  ): SearchProductDocument {
    const namesByLanguage = buildLocalizedMap(product.translations, (translation) => translation.name)
    const descriptionsByLanguage = buildLocalizedMap(product.translations, (translation) => translation.description)

    return {
      id: <Uuid>product.id,
      slug: product.slug,
      isSystem: product.isSystem,
      ownerId: <Uuid | null>product.ownerId,
      imageUrl: product.imageUrl ?? null,
      measurementBaseTypeKey: product.measurementBaseType.key,
      measurementUnitKey: product.measurementUnit?.key ?? null,
      namesByLanguage,
      descriptionsByLanguage,
      searchNames: uniqueValues([...Object.values(namesByLanguage), product.slug]),
      searchDescriptions: uniqueValues(Object.values(descriptionsByLanguage)),
      createdAtTs: product.createdAt.getTime(),
      updatedAtTs: product.updatedAt.getTime(),
    }
  }

  private mapRecipeToSearchDocument(
    recipe: Awaited<ReturnType<SearchRepository['findRecipesForIndexing']>>[number],
  ): SearchRecipeDocument {
    const titlesByLanguage = buildLocalizedMap(recipe.translations, (translation) => translation.title)
    const descriptionsByLanguage = buildLocalizedMap(recipe.translations, (translation) => translation.description)
    const difficultyLabelsByLanguage = buildLocalizedMap(
      recipe.difficulty.translations,
      (translation) => translation.label,
    )

    return {
      id: <Uuid>recipe.id,
      slug: recipe.slug,
      status: recipe.status,
      authorId: <Uuid>recipe.author.id,
      authorFirstName: recipe.author.firstName,
      authorLastName: recipe.author.lastName,
      imageUrl: recipe.imageUrl ?? null,
      difficultyKey: recipe.difficulty.key,
      difficultyLabelsByLanguage,
      cookingTimeMinutes: recipe.cookingTimeMinutes,
      servings: recipe.servings,
      publishedAtTs: recipe.publishedAt ? recipe.publishedAt.getTime() : null,
      titlesByLanguage,
      descriptionsByLanguage,
      searchTitles: uniqueValues([...Object.values(titlesByLanguage), recipe.slug]),
      searchDescriptions: uniqueValues(Object.values(descriptionsByLanguage)),
      createdAtTs: recipe.createdAt.getTime(),
      updatedAtTs: recipe.updatedAt.getTime(),
    }
  }

  private parseProductDocument(hit: Record<string, unknown>): SearchProductDocument | null {
    if (!isUuid(hit.id)) {
      return null
    }

    if (typeof hit.slug !== 'string') {
      return null
    }

    return {
      id: hit.id,
      slug: hit.slug,
      isSystem: Boolean(hit.isSystem),
      ownerId: isUuid(hit.ownerId) ? hit.ownerId : null,
      imageUrl: typeof hit.imageUrl === 'string' ? hit.imageUrl : null,
      measurementBaseTypeKey: <SearchProductDocument['measurementBaseTypeKey']>hit.measurementBaseTypeKey,
      measurementUnitKey: <SearchProductDocument['measurementUnitKey']>(
        (typeof hit.measurementUnitKey === 'string' ? hit.measurementUnitKey : null)
      ),
      namesByLanguage: normalizeStringMap(hit.namesByLanguage),
      descriptionsByLanguage: normalizeStringMap(hit.descriptionsByLanguage),
      searchNames: normalizeStringArray(hit.searchNames),
      searchDescriptions: normalizeStringArray(hit.searchDescriptions),
      createdAtTs: this.normalizeTimestamp(hit.createdAtTs),
      updatedAtTs: this.normalizeTimestamp(hit.updatedAtTs),
    }
  }

  private parseRecipeDocument(hit: Record<string, unknown>): SearchRecipeDocument | null {
    if (!isUuid(hit.id)) {
      return null
    }

    if (typeof hit.slug !== 'string') {
      return null
    }

    if (!isUuid(hit.authorId)) {
      return null
    }

    return {
      id: hit.id,
      slug: hit.slug,
      status: <RecipeStatus>hit.status,
      authorId: hit.authorId,
      authorFirstName: typeof hit.authorFirstName === 'string' ? hit.authorFirstName : null,
      authorLastName: typeof hit.authorLastName === 'string' ? hit.authorLastName : null,
      imageUrl: typeof hit.imageUrl === 'string' ? hit.imageUrl : null,
      difficultyKey: <SearchRecipeDocument['difficultyKey']>hit.difficultyKey,
      difficultyLabelsByLanguage: normalizeStringMap(hit.difficultyLabelsByLanguage),
      cookingTimeMinutes: this.normalizeNumber(hit.cookingTimeMinutes),
      servings: this.normalizeNullableNumber(hit.servings),
      publishedAtTs: this.normalizeNullableNumber(hit.publishedAtTs),
      titlesByLanguage: normalizeStringMap(hit.titlesByLanguage),
      descriptionsByLanguage: normalizeStringMap(hit.descriptionsByLanguage),
      searchTitles: normalizeStringArray(hit.searchTitles),
      searchDescriptions: normalizeStringArray(hit.searchDescriptions),
      createdAtTs: this.normalizeTimestamp(hit.createdAtTs),
      updatedAtTs: this.normalizeTimestamp(hit.updatedAtTs),
    }
  }

  private parseProductSyncPayload(payload: unknown): ProductSyncPayload {
    if (!isRecord(payload)) {
      throw new NonRetryableBackgroundJobError('Search product sync payload must be object.')
    }

    const productId = payload.productId
    const action = payload.action

    if (!isUuid(productId)) {
      throw new NonRetryableBackgroundJobError('Search product sync payload field "productId" is invalid.')
    }

    if (action !== 'UPSERT' && action !== 'DELETE') {
      throw new NonRetryableBackgroundJobError('Search product sync payload field "action" is invalid.')
    }

    return {
      productId,
      action,
    }
  }

  private parseRecipeSyncPayload(payload: unknown): RecipeSyncPayload {
    if (!isRecord(payload)) {
      throw new NonRetryableBackgroundJobError('Search recipe sync payload must be object.')
    }

    const recipeId = payload.recipeId
    const action = payload.action

    if (!isUuid(recipeId)) {
      throw new NonRetryableBackgroundJobError('Search recipe sync payload field "recipeId" is invalid.')
    }

    if (action !== 'UPSERT' && action !== 'DELETE') {
      throw new NonRetryableBackgroundJobError('Search recipe sync payload field "action" is invalid.')
    }

    return {
      recipeId,
      action,
    }
  }

  private parseReindexPayload(payload: unknown, expectedEntity: SearchReindexEntity): ReindexPayload {
    if (!isRecord(payload)) {
      throw new NonRetryableBackgroundJobError('Search reindex payload must be object.')
    }

    const entity = payload.entity

    if (entity !== expectedEntity) {
      throw new NonRetryableBackgroundJobError('Search reindex payload field "entity" is invalid.')
    }

    return {
      entity,
    }
  }

  private extractTotalItems(
    response: { estimatedTotalHits?: unknown; totalHits?: unknown; total?: unknown },
    fallback: number,
  ): number {
    const rawTotal =
      (typeof response.estimatedTotalHits === 'number' ? response.estimatedTotalHits : null) ??
      (typeof response.totalHits === 'number' ? response.totalHits : null) ??
      (typeof response.total === 'number' ? response.total : null)

    return rawTotal ?? fallback
  }

  private buildPaginationMeta(page: number, limit: number, totalItems: number): PaginationMeta {
    const pageCount = Math.max(1, Math.ceil(totalItems / limit))

    return {
      totalItems,
      page,
      perPage: limit,
      pageCount,
      hasNextPage: page < pageCount,
      hasPrevPage: page > 1,
    }
  }

  private escapeFilterValue(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  }

  private normalizeTimestamp(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      return value
    }

    return Date.now()
  }

  private normalizeNumber(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    return 0
  }

  private normalizeNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    return null
  }

  private mapBackgroundJob(backgroundJob: BackgroundJob): {
    id: Uuid
    type: BackgroundJobType
    status: BackgroundJobStatus
    attempts: number
    maxAttempts: number
    runAt: Date
    startedAt?: Date | null
    finishedAt?: Date | null
    result?: unknown
    error?: unknown
    createdAt: Date
    updatedAt: Date
  } {
    return {
      id: <Uuid>backgroundJob.id,
      type: backgroundJob.type,
      status: backgroundJob.status,
      attempts: backgroundJob.attempts,
      maxAttempts: backgroundJob.maxAttempts,
      runAt: backgroundJob.runAt,
      startedAt: backgroundJob.startedAt,
      finishedAt: backgroundJob.finishedAt,
      result: backgroundJob.result,
      error: backgroundJob.error,
      createdAt: backgroundJob.createdAt,
      updatedAt: backgroundJob.updatedAt,
    }
  }

  public async enqueueProductSyncJob(
    productId: Uuid,
    userId: Uuid | null,
    action: SearchSyncAction,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const db = tx ?? this.prismaService

    await db.backgroundJob.create({
      data: {
        type: BackgroundJobType.SEARCH_SYNC_PRODUCT,
        status: BackgroundJobStatus.PENDING,
        ...(userId ? { userId } : {}),
        dedupKey: `search-sync-product:${productId}:${action}:${randomHash()}`,
        payload: {
          productId,
          action,
        },
      },
    })
  }

  public async enqueueRecipeSyncJob(
    recipeId: Uuid,
    userId: Uuid | null,
    action: SearchSyncAction,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const db = tx ?? this.prismaService

    await db.backgroundJob.create({
      data: {
        type: BackgroundJobType.SEARCH_SYNC_RECIPE,
        status: BackgroundJobStatus.PENDING,
        ...(userId ? { userId } : {}),
        dedupKey: `search-sync-recipe:${recipeId}:${action}:${randomHash()}`,
        payload: {
          recipeId,
          action,
        },
      },
    })
  }
}
