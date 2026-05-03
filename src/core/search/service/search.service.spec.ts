import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import {
  BackgroundJobStatus,
  BackgroundJobType,
  LanguageCode,
  MeasurementBaseTypeKey,
  RecipeDifficultyKey,
  RecipeStatus,
} from '@prisma/client'
import { SearchProductQueryDto, SearchReindexEntity } from '../dto'
import { SearchService } from './search.service'

const LANGUAGE_EN_ID = '11111111-1111-4111-8111-111111111111'
const LANGUAGE_UK_ID = '22222222-2222-4222-8222-222222222222'
const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const RECIPE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

function createBackgroundJobEntity(type: BackgroundJobType): any {
  const now = new Date('2026-01-01T00:00:00.000Z')

  return {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    type,
    status: BackgroundJobStatus.PENDING,
    attempts: 0,
    maxAttempts: 3,
    runAt: now,
    startedAt: null,
    finishedAt: null,
    result: null,
    error: null,
    createdAt: now,
    updatedAt: now,
  }
}

describe('SearchService', () => {
  const searchRepository: any = {
    findProductsForIndexing: jest.fn(),
    findRecipesForIndexing: jest.fn(),
    findAllLanguageCodes: jest.fn(),
  }

  const languageService: any = {
    getLanguageOrDefault: jest.fn(),
    getDefaultLanguage: jest.fn(),
  }

  const meilisearchService: any = {
    productsIndexUid: 'products',
    recipesIndexUid: 'recipes',
    ensureIndex: jest.fn(),
    search: jest.fn(),
    deleteDocument: jest.fn(),
    upsertDocuments: jest.fn(),
    deleteAllDocuments: jest.fn(),
  }

  const prismaService: any = {
    backgroundJob: {
      createManyAndReturn: jest.fn(),
      create: jest.fn(),
    },
  }

  let searchService: SearchService

  beforeEach(() => {
    jest.clearAllMocks()

    languageService.getLanguageOrDefault.mockResolvedValue({
      id: LANGUAGE_EN_ID,
      code: LanguageCode.EN,
    })
    languageService.getDefaultLanguage.mockResolvedValue({
      id: LANGUAGE_UK_ID,
      code: LanguageCode.UK,
    })

    searchService = new SearchService(
      searchRepository as never,
      languageService as never,
      meilisearchService as never,
      prismaService as never,
    )
  })

  it('should return localized product search results and apply filters', async () => {
    meilisearchService.search.mockResolvedValue({
      hits: [
        {
          id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          slug: 'potato',
          isSystem: true,
          ownerId: null,
          imageUrl: null,
          measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
          measurementUnitKey: null,
          namesByLanguage: {
            en: 'Potato',
            uk: 'Картопля',
          },
          descriptionsByLanguage: {
            en: 'Fresh potato',
          },
          searchNames: ['Potato'],
          searchDescriptions: ['Fresh potato'],
          createdAtTs: Date.now(),
          updatedAtTs: Date.now(),
        },
      ],
      estimatedTotalHits: 1,
    })

    const query = {
      filter: {
        search: 'pot',
        measurementBaseType: MeasurementBaseTypeKey.MASS,
        isSystem: true,
      },
      pagination: {
        page: 1,
        limit: 10,
      },
    } as SearchProductQueryDto

    const result = await searchService.searchProducts(query, LanguageCode.EN)

    expect(result.items).toHaveLength(1)
    expect(result.items[0].name).toBe('Potato')
    expect(meilisearchService.search).toHaveBeenCalledWith(
      'products',
      'pot',
      expect.objectContaining({
        filter: 'measurementBaseTypeKey = "MASS" AND isSystem = true',
      }),
    )
  })

  it('should delete recipe index document for unpublished recipe during SEARCH_SYNC_RECIPE', async () => {
    searchRepository.findRecipesForIndexing.mockResolvedValue([
      {
        id: RECIPE_ID,
        slug: 'test',
        status: RecipeStatus.DRAFT,
      },
    ])

    const result = await searchService.handleSearchSyncRecipeJob({
      ...createBackgroundJobEntity(BackgroundJobType.SEARCH_SYNC_RECIPE),
      payload: {
        recipeId: RECIPE_ID,
        action: 'UPSERT',
      },
      userId: USER_ID,
    } as never)

    expect(meilisearchService.deleteDocument).toHaveBeenCalledWith('recipes', RECIPE_ID)
    expect(result.deletedUnpublished).toBe(true)
  })

  it('should create both reindex jobs by default', async () => {
    prismaService.backgroundJob.createManyAndReturn.mockResolvedValue([
      createBackgroundJobEntity(BackgroundJobType.SEARCH_REINDEX_PRODUCTS),
      createBackgroundJobEntity(BackgroundJobType.SEARCH_REINDEX_RECIPES),
    ])

    const result = await searchService.createReindexJobs(
      {
        id: USER_ID,
      } as never,
      {
        entities: [SearchReindexEntity.PRODUCTS, SearchReindexEntity.RECIPES],
      },
    )

    expect(prismaService.backgroundJob.createManyAndReturn).toHaveBeenCalled()
    expect(result).toHaveLength(2)
  })

  it('should return fallback meta and skip invalid documents during search parsing', async () => {
    meilisearchService.search.mockResolvedValue({
      hits: [
        {
          id: 'invalid-id',
        },
      ],
    })

    const result = await searchService.searchProducts(
      {
        filter: {
          search: 'query',
        },
      } as never,
      LanguageCode.EN,
    )

    expect(result.items).toHaveLength(0)
    expect(result.meta.totalItems).toBe(0)
  })

  it('should handle search product sync delete and upsert branches', async () => {
    const deleteResult = await searchService.handleSearchSyncProductJob({
      ...createBackgroundJobEntity(BackgroundJobType.SEARCH_SYNC_PRODUCT),
      payload: {
        productId: RECIPE_ID,
        action: 'DELETE',
      },
    } as never)

    expect(meilisearchService.deleteDocument).toHaveBeenCalledWith('products', RECIPE_ID)
    expect(deleteResult).toEqual({
      type: BackgroundJobType.SEARCH_SYNC_PRODUCT,
      action: 'DELETE',
      productId: RECIPE_ID,
    })

    searchRepository.findProductsForIndexing.mockResolvedValueOnce([])

    const missingResult = await searchService.handleSearchSyncProductJob({
      ...createBackgroundJobEntity(BackgroundJobType.SEARCH_SYNC_PRODUCT),
      payload: {
        productId: RECIPE_ID,
        action: 'UPSERT',
      },
    } as never)

    expect(missingResult.deletedMissing).toBe(true)

    searchRepository.findProductsForIndexing.mockResolvedValueOnce([
      {
        id: RECIPE_ID,
        slug: 'potato',
        isSystem: true,
        ownerId: null,
        imageUrl: null,
        measurementBaseType: { key: MeasurementBaseTypeKey.MASS },
        measurementUnit: { key: 'G' },
        translations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const upsertResult = await searchService.handleSearchSyncProductJob({
      ...createBackgroundJobEntity(BackgroundJobType.SEARCH_SYNC_PRODUCT),
      payload: {
        productId: RECIPE_ID,
        action: 'UPSERT',
      },
    } as never)

    expect(meilisearchService.upsertDocuments).toHaveBeenCalled()
    expect(upsertResult.upserted).toBe(true)
  })

  it('should handle search recipe sync delete branch', async () => {
    const result = await searchService.handleSearchSyncRecipeJob({
      ...createBackgroundJobEntity(BackgroundJobType.SEARCH_SYNC_RECIPE),
      payload: {
        recipeId: RECIPE_ID,
        action: 'DELETE',
      },
    } as never)

    expect(meilisearchService.deleteDocument).toHaveBeenCalledWith('recipes', RECIPE_ID)
    expect(result).toEqual({
      type: BackgroundJobType.SEARCH_SYNC_RECIPE,
      action: 'DELETE',
      recipeId: RECIPE_ID,
    })
  })

  it('should reindex products and recipes', async () => {
    searchRepository.findProductsForIndexing.mockResolvedValue([
      {
        id: 'product-id',
        slug: 'potato',
        isSystem: true,
        ownerId: null,
        imageUrl: null,
        measurementBaseType: { key: MeasurementBaseTypeKey.MASS },
        measurementUnit: { key: 'G' },
        translations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    searchRepository.findRecipesForIndexing.mockResolvedValue([
      {
        id: RECIPE_ID,
        slug: 'recipe',
        status: RecipeStatus.PUBLISHED,
        author: {
          id: USER_ID,
          firstName: 'John',
          lastName: 'Doe',
        },
        imageUrl: null,
        difficulty: {
          key: RecipeDifficultyKey.EASY,
          translations: [],
        },
        cookingTimeMinutes: 30,
        servings: 2,
        publishedAt: new Date(),
        translations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'draft-recipe-id',
        slug: 'draft-recipe',
        status: RecipeStatus.DRAFT,
      },
    ])

    const productsResult = await searchService.handleSearchReindexProductsJob({
      ...createBackgroundJobEntity(BackgroundJobType.SEARCH_REINDEX_PRODUCTS),
      payload: { entity: SearchReindexEntity.PRODUCTS },
    } as never)

    const recipesResult = await searchService.handleSearchReindexRecipesJob({
      ...createBackgroundJobEntity(BackgroundJobType.SEARCH_REINDEX_RECIPES),
      payload: { entity: SearchReindexEntity.RECIPES },
    } as never)

    expect(meilisearchService.deleteAllDocuments).toHaveBeenCalledTimes(2)
    expect(meilisearchService.upsertDocuments).toHaveBeenCalled()
    expect(productsResult.indexedDocuments).toBe(1)
    expect(recipesResult.indexedDocuments).toBe(1)
  })

  it('should enqueue sync jobs for products and recipes', async () => {
    await searchService.enqueueProductSyncJob(RECIPE_ID as never, USER_ID as never, 'UPSERT')
    await searchService.enqueueRecipeSyncJob(RECIPE_ID as never, null, 'DELETE')

    expect(prismaService.backgroundJob.create).toHaveBeenCalledTimes(2)
    expect(prismaService.backgroundJob.create.mock.calls[0][0].data.type).toBe(BackgroundJobType.SEARCH_SYNC_PRODUCT)
    expect(prismaService.backgroundJob.create.mock.calls[1][0].data.type).toBe(BackgroundJobType.SEARCH_SYNC_RECIPE)
  })

  it('should validate payload parsers for non-retryable errors', () => {
    expect(() => (searchService as any).parseProductSyncPayload({ productId: 'bad-id', action: 'UPSERT' })).toThrow()
    expect(() => (searchService as any).parseRecipeSyncPayload({ recipeId: 'bad-id', action: 'UPSERT' })).toThrow()
    expect(() =>
      (searchService as any).parseReindexPayload({ entity: SearchReindexEntity.PRODUCTS }, SearchReindexEntity.RECIPES),
    ).toThrow()
  })

  it('should normalize helper values and escape filters', () => {
    const escaped = (searchService as any).escapeFilterValue('a\\"b')
    const timestamp = (searchService as any).normalizeTimestamp(-1)
    const number = (searchService as any).normalizeNumber('wrong')
    const nullableNumber = (searchService as any).normalizeNullableNumber('wrong')
    const pagination = (searchService as any).buildPaginationMeta(2, 10, 25)
    const total = (searchService as any).extractTotalItems({ estimatedTotalHits: 9 }, 1)

    expect(escaped).toBe('a\\\\\\"b')
    expect(typeof timestamp).toBe('number')
    expect(number).toBe(0)
    expect(nullableNumber).toBeNull()
    expect(pagination).toEqual({
      totalItems: 25,
      page: 2,
      perPage: 10,
      pageCount: 3,
      hasNextPage: true,
      hasPrevPage: true,
    })
    expect(total).toBe(9)
  })
})
