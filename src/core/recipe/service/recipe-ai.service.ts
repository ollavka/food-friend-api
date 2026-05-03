import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { Inject, Injectable } from '@nestjs/common'
import {
  BackgroundJob,
  BackgroundJobStatus,
  BackgroundJobType,
  LanguageCode,
  MeasurementBaseTypeKey,
  MeasurementUnitKey,
  Prisma,
  RecipeDifficultyKey,
  RecipeStatus,
  User,
  UserRole,
} from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { AppBadRequestException, AppEntityNotFoundException } from '@common/exception'
import { MulterFile, Uuid } from '@common/type'
import {
  getLanguageLabelByCode,
  hashToUuid,
  isRecord,
  isUuid,
  normalizeOptionalString,
  normalizeRequiredString,
  normalizeStringArray,
  pickTranslationByLanguage,
  randomHash,
  uuidToHash,
} from '@common/util'
import { NonRetryableBackgroundJobError } from '@core/background-job'
import { BackgroundJobApiModel } from '@core/background-job/api-model'
import { LanguageService } from '@core/language'
import { ProductService } from '@core/product'
import { CreateProductDto } from '@core/product/dto'
import { SearchService } from '@core/search'
import { UserService } from '@core/user'
import {
  AI_PROVIDER_TOKEN,
  AiProvider,
  GenerateImageInput,
  GenerateStructuredJsonContentPart,
  GenerateStructuredJsonInput,
} from '@infrastructure/ai'
import { AWSBucketService } from '@infrastructure/aws-bucket'
import { PrismaService } from '@infrastructure/database'
import { CreateRecipeDto, CreateRecipeFromPhotoDto, CreateRecipeImageDto } from '../dto'
import { RecipeRepository } from '../repository'
import {
  RecipeFromPhotoIngredientNormalized,
  RecipeFromPhotoNormalized,
  buildRecipeImagePrompt,
  extractRecipeFileNameFromUrl,
  getImageExtensionByContentType,
  ingredientMatchKey,
  normalizeIngredientName,
  normalizeIngredientQuantity,
  normalizeRecipeFromPhotoOutput,
  slugifyForMatching,
} from '../util'
import { RecipeService } from './recipe.service'

type RecipeImageAnalysisPayload = {
  sourceLanguageId: Uuid
  imageUrl: string
  imageKey: string
  prompt?: string | null
}

type RecipeImageGenerationPayload = {
  recipeId: Uuid
  languageId: Uuid
  prompt?: string | null
}

type SourceImage = {
  imageUrl: string
  imageKey: string
}

type ResolvedIngredient = {
  productId: Uuid
  measurementUnitId: Uuid
  quantity: number
  note?: string
}

type RecipeFromPhotoIngredientOutput = RecipeFromPhotoIngredientNormalized
type RecipeFromPhotoOutput = RecipeFromPhotoNormalized

@Injectable()
export class RecipeAiService {
  private readonly maxImageSizeBytes = 10 * 1024 * 1024

  private readonly imageDownloadTimeoutMs = 10_000

  private readonly imageDownloadAttempts = 2

  public constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly recipeService: RecipeService,
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly languageService: LanguageService,
    private readonly searchService: SearchService,
    private readonly prismaService: PrismaService,
    private readonly awsBucketService: AWSBucketService,
    @Inject(AI_PROVIDER_TOKEN) private readonly aiProvider: AiProvider,
  ) {}

  public async createRecipeFromPhotoJob(
    user: User,
    languageCode: LanguageCode,
    dto: CreateRecipeFromPhotoDto,
    file?: MulterFile,
  ): Promise<BackgroundJobApiModel> {
    const sourceLanguage = await this.languageService.getLanguageOrDefault(languageCode)
    const sourceImage = await this.prepareRecipePhotoSource(dto, file)

    const createdBackgroundJob = await this.prismaService.backgroundJob.create({
      data: {
        type: BackgroundJobType.RECIPE_IMAGE_ANALYSIS,
        status: BackgroundJobStatus.PENDING,
        dedupKey: `recipe-image-analysis:${user.id}:${randomHash()}`,
        user: {
          connect: {
            id: user.id,
          },
        },
        payload: {
          sourceLanguageId: sourceLanguage.id,
          imageUrl: sourceImage.imageUrl,
          imageKey: sourceImage.imageKey,
          prompt: dto.prompt ?? null,
        },
      },
    })

    return BackgroundJobApiModel.from(this.mapBackgroundJob(createdBackgroundJob))
  }

  public async createRecipeImageJob(
    user: User,
    languageCode: LanguageCode,
    dto: CreateRecipeImageDto,
  ): Promise<BackgroundJobApiModel> {
    if (!dto.recipeId) {
      throw new AppBadRequestException('ai.recipe-id-required', 'Recipe id is required for image generation.')
    }

    const recipeId = <Uuid>hashToUuid(dto.recipeId)

    if (!isUuid(recipeId)) {
      throw new AppBadRequestException('ai.recipe-id-required', 'Recipe id is required for image generation.')
    }

    const recipeForAccess = await this.recipeRepository.findRecipeForImageGenerationAccess(recipeId)

    if (!recipeForAccess) {
      throw AppEntityNotFoundException.byId('Recipe', recipeId)
    }

    this.enforceRecipeImageAccess(recipeForAccess.authorId, user)

    if (recipeForAccess.status === RecipeStatus.ARCHIVED) {
      throw new AppBadRequestException(
        'ai.recipe-image-status',
        'Image generation is not available for archived recipe.',
      )
    }

    const language = await this.languageService.getLanguageOrDefault(languageCode)

    const createdBackgroundJob = await this.prismaService.backgroundJob.create({
      data: {
        type: BackgroundJobType.RECIPE_IMAGE_GENERATION,
        status: BackgroundJobStatus.PENDING,
        dedupKey: `recipe-image-generation:${recipeId}:${user.id}:${randomHash()}`,
        user: {
          connect: {
            id: user.id,
          },
        },
        recipe: {
          connect: {
            id: recipeId,
          },
        },
        payload: {
          recipeId,
          languageId: language.id,
          prompt: dto.prompt ?? null,
        },
      },
    })

    return BackgroundJobApiModel.from(this.mapBackgroundJob(createdBackgroundJob))
  }

  public async handleRecipeTranslationJob(backgroundJob: BackgroundJob): Promise<Record<string, unknown>> {
    const payload = this.parseTranslationPayload(backgroundJob.payload)

    const recipe = await this.recipeRepository.findRecipeForTranslation(
      payload.recipeId,
      payload.sourceLanguageId,
      payload.targetLanguageId,
    )

    if (!recipe) {
      throw new NonRetryableBackgroundJobError('Recipe for translation not found.', {
        recipeId: payload.recipeId,
      })
    }

    const sourceTranslation =
      recipe.translations.find((translation) => translation.languageId === payload.sourceLanguageId) ??
      recipe.translations[0] ??
      null

    if (!sourceTranslation) {
      throw new NonRetryableBackgroundJobError('Source recipe translation does not exist.', {
        recipeId: payload.recipeId,
        sourceLanguageId: payload.sourceLanguageId,
      })
    }

    const sourceStepContents = recipe.steps.map((step) => {
      const sourceStepTranslation =
        step.translations.find((translation) => translation.languageId === payload.sourceLanguageId) ??
        step.translations[0] ??
        null

      if (!sourceStepTranslation) {
        throw new NonRetryableBackgroundJobError('Source recipe step translation does not exist.', {
          recipeId: payload.recipeId,
          stepId: step.id,
          sourceLanguageId: payload.sourceLanguageId,
        })
      }

      return sourceStepTranslation.content
    })

    const [sourceLanguage, targetLanguage] = await Promise.all([
      this.languageService.getLanguageById(payload.sourceLanguageId),
      this.languageService.getLanguageById(payload.targetLanguageId),
    ])

    if (!sourceLanguage || !targetLanguage) {
      throw new NonRetryableBackgroundJobError('Source or target language does not exist.', {
        sourceLanguageId: payload.sourceLanguageId,
        targetLanguageId: payload.targetLanguageId,
      })
    }

    const translated = await this.translateRecipeFields({
      sourceLanguageCode: sourceLanguage.code,
      targetLanguageCode: targetLanguage.code,
      title: sourceTranslation.title,
      description: sourceTranslation.description,
      steps: sourceStepContents,
    })

    const translatedSteps = sourceStepContents.map((sourceStep, index) => {
      const translatedStep = translated.steps[index]
      return translatedStep && translatedStep.trim().length > 0 ? translatedStep : sourceStep
    })

    const recipeTranslationResult = await this.prismaService.$transaction(async (tx) => {
      const recipeTranslation = await this.recipeRepository.upsertRecipeTranslation(
        payload.recipeId,
        payload.targetLanguageId,
        {
          title: translated.title || sourceTranslation.title,
          description: translated.description ?? sourceTranslation.description ?? null,
        },
        tx,
      )

      let updatedStepsCount = 0
      let skippedManualStepsCount = 0

      for (const [index, step] of recipe.steps.entries()) {
        const stepTranslationResult = await this.recipeRepository.upsertRecipeStepTranslation(
          <Uuid>step.id,
          payload.targetLanguageId,
          translatedSteps[index] ?? sourceStepContents[index],
          tx,
        )

        if (stepTranslationResult.updated) {
          updatedStepsCount += 1
        }

        if (stepTranslationResult.skippedManual) {
          skippedManualStepsCount += 1
        }
      }

      return {
        recipeTranslation,
        updatedStepsCount,
        skippedManualStepsCount,
      }
    })

    if (recipeTranslationResult.recipeTranslation.updated || recipeTranslationResult.updatedStepsCount > 0) {
      await this.searchService.enqueueRecipeSyncJob(payload.recipeId, backgroundJob.userId, 'UPSERT')
    }

    return {
      type: BackgroundJobType.RECIPE_TRANSLATION,
      recipeId: payload.recipeId,
      targetLanguageId: payload.targetLanguageId,
      updatedRecipeTranslation: recipeTranslationResult.recipeTranslation.updated,
      skippedManualRecipeTranslation: recipeTranslationResult.recipeTranslation.skippedManual,
      updatedStepsCount: recipeTranslationResult.updatedStepsCount,
      skippedManualStepsCount: recipeTranslationResult.skippedManualStepsCount,
    }
  }

  public async handleRecipeImageAnalysisJob(backgroundJob: BackgroundJob): Promise<Record<string, unknown>> {
    const payload = this.parseRecipeImageAnalysisPayload(backgroundJob.payload)
    const [sourceLanguage, owner] = await Promise.all([
      this.languageService.getLanguageById(payload.sourceLanguageId),
      backgroundJob.userId ? this.userService.findById(backgroundJob.userId) : null,
    ])

    if (!sourceLanguage) {
      throw new NonRetryableBackgroundJobError('Source language does not exist.', {
        sourceLanguageId: payload.sourceLanguageId,
      })
    }

    if (!owner) {
      throw new NonRetryableBackgroundJobError('Background job owner is not found.', {
        userId: backgroundJob.userId,
      })
    }

    const draft = await this.generateRecipeFromPhoto({
      imageUrl: payload.imageUrl,
      prompt: payload.prompt,
      sourceLanguageCode: sourceLanguage.code,
    })

    const { ingredients, createdProductIds, usedExistingProductIds, warnings } = await this.resolveIngredientsForDraft(
      owner,
      sourceLanguage.code,
      payload.sourceLanguageId,
      draft.ingredients,
    )

    if (ingredients.length === 0) {
      throw new NonRetryableBackgroundJobError('Recipe draft ingredients are empty.')
    }

    const recipeDto = this.buildRecipeFromPhotoCreateDto(draft, payload, ingredients)
    const createdRecipe = await this.recipeService.createRecipe(owner, recipeDto, sourceLanguage.code)

    return {
      type: BackgroundJobType.RECIPE_IMAGE_ANALYSIS,
      recipeId: this.toPublicId(createdRecipe.id),
      createdProductIds: createdProductIds.map((id) => this.toPublicId(id)),
      usedExistingProductIds: usedExistingProductIds.map((id) => this.toPublicId(id)),
      sourceImage: {
        imageUrl: payload.imageUrl,
        imageKey: payload.imageKey,
      },
      warnings,
    }
  }

  public async handleRecipeImageGenerationJob(backgroundJob: BackgroundJob): Promise<Record<string, unknown>> {
    const payload = this.parseRecipeImageGenerationPayload(backgroundJob.payload)

    const [language, defaultLanguage] = await Promise.all([
      this.languageService.getLanguageById(payload.languageId),
      this.languageService.getDefaultLanguage(),
    ])

    if (!language) {
      throw new NonRetryableBackgroundJobError('Recipe image generation language does not exist.', {
        languageId: payload.languageId,
      })
    }

    const recipe = await this.recipeRepository.findRecipeForImageGeneration(payload.recipeId, [
      payload.languageId,
      defaultLanguage.id,
    ])

    if (!recipe) {
      throw new NonRetryableBackgroundJobError('Recipe for image generation not found.', {
        recipeId: payload.recipeId,
      })
    }

    if (recipe.status === RecipeStatus.ARCHIVED) {
      throw new NonRetryableBackgroundJobError('Recipe for image generation is archived.', {
        recipeId: payload.recipeId,
      })
    }

    const translation = pickTranslationByLanguage(recipe.translations, payload.languageId, defaultLanguage.id)
    const steps = recipe.steps
      .map(
        (step) => pickTranslationByLanguage(step.translations, payload.languageId, defaultLanguage.id)?.content ?? null,
      )
      .filter((step): step is string => !!step)

    const imageRequest: GenerateImageInput = {
      prompt: buildRecipeImagePrompt({
        title: translation?.title ?? 'Recipe',
        description: translation?.description ?? null,
        steps,
        languageCode: language.code,
        prompt: payload.prompt,
      }),
    }
    const image = await this.aiProvider.generateImage(imageRequest)

    const extension = getImageExtensionByContentType(image.mimeType)
    const uploadedImage = await this.awsBucketService.upload(
      {
        originalname: `recipe-image-${randomHash()}.${extension}`,
        mimetype: image.mimeType,
        buffer: image.buffer,
        size: image.buffer.length,
      } as MulterFile,
      'recipes/generated',
    )

    const previousImageKey = recipe.imageKey ?? null

    try {
      await this.recipeRepository.updateRecipeImage(payload.recipeId, {
        imageKey: uploadedImage.key,
        imageUrl: uploadedImage.url,
      })
    } catch (error) {
      await this.tryRemoveS3Object(uploadedImage.key)
      throw error
    }

    await this.searchService.enqueueRecipeSyncJob(payload.recipeId, backgroundJob.userId, 'UPSERT')

    let deletedPreviousImage = false
    const warnings: string[] = []

    if (previousImageKey && previousImageKey !== uploadedImage.key) {
      try {
        await this.awsBucketService.remove(previousImageKey)
        deletedPreviousImage = true
      } catch {
        warnings.push('Failed to delete previous recipe image from S3.')
      }
    }

    return {
      type: BackgroundJobType.RECIPE_IMAGE_GENERATION,
      recipeId: this.toPublicId(payload.recipeId),
      imageKey: uploadedImage.key,
      imageUrl: uploadedImage.url,
      ...(previousImageKey ? { previousImageKey } : {}),
      deletedPreviousImage,
      providerMeta: image.providerMeta ?? null,
      warnings,
    }
  }

  private async resolveIngredientsForDraft(
    user: User,
    sourceLanguageCode: LanguageCode,
    sourceLanguageId: Uuid,
    draftIngredients: RecipeFromPhotoIngredientOutput[],
  ): Promise<{
    ingredients: ResolvedIngredient[]
    createdProductIds: Uuid[]
    usedExistingProductIds: Uuid[]
    warnings: string[]
  }> {
    const allUnitKeys = [
      ...new Set([...draftIngredients.map((item) => item.measurementUnitKey), MeasurementUnitKey.PC]),
    ]
    const units = await this.recipeRepository.findMeasurementUnitsByKeys(allUnitKeys)
    const unitByKey = new Map(units.map((unit) => [unit.key, unit]))

    const defaultUnit = unitByKey.get(MeasurementUnitKey.PC)

    if (!defaultUnit) {
      throw new NonRetryableBackgroundJobError('Measurement unit PC does not exist in database.')
    }

    const names = [...new Set(draftIngredients.map((item) => normalizeIngredientName(item.name)).filter(Boolean))]
    const slugs = [...new Set(names.map((name) => slugifyForMatching(name)).filter(Boolean))]

    const matchedProducts = await this.recipeRepository.findProductsForIngredientMatching(
      sourceLanguageId,
      user.id,
      names,
      slugs,
    )

    const productsByName = new Map<string, { id: Uuid; slug: string }>()
    const productsBySlug = new Map<string, { id: Uuid; slug: string }>()

    for (const product of matchedProducts) {
      if (product.translationName) {
        productsByName.set(ingredientMatchKey(product.translationName), { id: product.id, slug: product.slug })
      }

      productsBySlug.set(slugifyForMatching(product.slug), { id: product.id, slug: product.slug })
    }

    const createdByName = new Map<string, Uuid>()
    const createdProductIds = new Set<Uuid>()
    const usedExistingProductIds = new Set<Uuid>()
    const warnings: string[] = []

    const resolvedIngredients: ResolvedIngredient[] = []

    for (const ingredient of draftIngredients) {
      const name = normalizeIngredientName(ingredient.name)

      if (!name) {
        continue
      }

      const normalizedName = ingredientMatchKey(name)
      const slug = slugifyForMatching(name)
      const matchedProduct = productsByName.get(normalizedName) ?? productsBySlug.get(slug)

      let productId: Uuid

      if (matchedProduct) {
        productId = matchedProduct.id
        usedExistingProductIds.add(productId)
      } else if (createdByName.has(normalizedName)) {
        productId = createdByName.get(normalizedName)!
      } else {
        const unitForProduct = unitByKey.get(ingredient.measurementUnitKey) ?? defaultUnit
        const createdProductId = await this.createProductForIngredient(
          user,
          sourceLanguageCode,
          name,
          unitForProduct.id,
          unitForProduct.baseTypeKey,
        )

        productId = createdProductId
        createdByName.set(normalizedName, createdProductId)
        createdProductIds.add(createdProductId)
      }

      const selectedUnit = unitByKey.get(ingredient.measurementUnitKey) ?? defaultUnit

      if (!unitByKey.get(ingredient.measurementUnitKey)) {
        warnings.push(`Fallback measurement unit for ingredient "${name}" to PC.`)
      }

      resolvedIngredients.push({
        productId,
        measurementUnitId: selectedUnit.id,
        quantity: normalizeIngredientQuantity(ingredient.quantity),
        ...(ingredient.note ? { note: ingredient.note } : {}),
      })
    }

    return {
      ingredients: resolvedIngredients,
      createdProductIds: [...createdProductIds],
      usedExistingProductIds: [...usedExistingProductIds],
      warnings,
    }
  }

  private async createProductForIngredient(
    user: User,
    sourceLanguageCode: LanguageCode,
    name: string,
    measurementUnitId: Uuid,
    measurementBaseType: MeasurementBaseTypeKey,
  ): Promise<Uuid> {
    const dto: CreateProductDto = {
      name,
      measurementBaseType,
      measurementUnitId: uuidToHash(measurementUnitId),
      isSystem: false,
    }

    const createdProduct = await this.productService.createProduct(user, dto, sourceLanguageCode)
    const productId = <Uuid>hashToUuid(createdProduct.id)

    if (!isUuid(productId)) {
      throw new NonRetryableBackgroundJobError('Failed to resolve created product id.', {
        name,
      })
    }

    return productId
  }

  private buildRecipeFromPhotoCreateDto(
    draft: RecipeFromPhotoOutput,
    payload: RecipeImageAnalysisPayload,
    ingredients: ResolvedIngredient[],
  ): CreateRecipeDto {
    const steps = draft.steps
      .map((step) => step.trim())
      .filter(Boolean)
      .map((step) => ({ content: step }))

    const normalizedSteps = steps.length > 0 ? steps : [{ content: 'Prepare ingredients and cook until ready.' }]
    const nutrition = this.buildEstimatedNutritionInput(draft.nutrition)

    return {
      title: draft.title,
      description: draft.description ?? undefined,
      cookingTimeMinutes: Math.max(0, Math.round(draft.cookingTimeMinutes)),
      servings: draft.servings ? Math.max(1, Math.round(draft.servings)) : undefined,
      difficulty: draft.difficulty,
      status: RecipeStatus.DRAFT,
      imageUrl: payload.imageUrl,
      imageKey: payload.imageKey,
      steps: normalizedSteps,
      ingredients: ingredients.map((ingredient) => ({
        productId: uuidToHash(ingredient.productId),
        measurementUnitId: uuidToHash(ingredient.measurementUnitId),
        quantity: ingredient.quantity,
        note: ingredient.note,
      })),
      ...(nutrition ? { nutrition } : {}),
    }
  }

  private buildEstimatedNutritionInput(
    nutrition: RecipeFromPhotoOutput['nutrition'],
  ): CreateRecipeDto['nutrition'] | undefined {
    if (!nutrition) {
      return
    }

    const data = {
      ...(nutrition.kcal !== null && nutrition.kcal !== undefined ? { kcal: nutrition.kcal } : {}),
      ...(nutrition.proteins !== null && nutrition.proteins !== undefined ? { proteins: nutrition.proteins } : {}),
      ...(nutrition.fats !== null && nutrition.fats !== undefined ? { fats: nutrition.fats } : {}),
      ...(nutrition.carbs !== null && nutrition.carbs !== undefined ? { carbs: nutrition.carbs } : {}),
      ...(nutrition.fiber !== null && nutrition.fiber !== undefined ? { fiber: nutrition.fiber } : {}),
      ...(nutrition.sugar !== null && nutrition.sugar !== undefined ? { sugar: nutrition.sugar } : {}),
      ...(nutrition.sodiumMg !== null && nutrition.sodiumMg !== undefined ? { sodiumMg: nutrition.sodiumMg } : {}),
    }

    if (Object.keys(data).length === 0) {
      return
    }

    return {
      ...data,
      isEstimated: true,
    }
  }

  private async prepareRecipePhotoSource(dto: CreateRecipeFromPhotoDto, file?: MulterFile): Promise<SourceImage> {
    if (file) {
      this.validateUploadedImageFile(file)
      const uploaded = await this.awsBucketService.upload(file, 'recipes/source')
      return {
        imageKey: uploaded.key,
        imageUrl: uploaded.url,
      }
    }

    if (!dto.imageUrl) {
      throw new AppBadRequestException('ai.photo-source-required', 'Provide recipe photo file or imageUrl.')
    }

    return this.mirrorExternalImageToS3(dto.imageUrl)
  }

  private async mirrorExternalImageToS3(imageUrl: string): Promise<SourceImage> {
    const file = await this.downloadImageFromUrl(imageUrl)
    this.validateUploadedImageFile(file)
    const uploaded = await this.awsBucketService.upload(file, 'recipes/source')

    return {
      imageKey: uploaded.key,
      imageUrl: uploaded.url,
    }
  }

  private validateUploadedImageFile(file: MulterFile): void {
    const mimeType = file.mimetype?.toLowerCase() ?? ''

    if (!mimeType.startsWith('image/')) {
      throw new AppBadRequestException('ai.image-content-type', 'Only image content type is supported.')
    }

    if (file.size <= 0 || file.buffer.length <= 0) {
      throw new AppBadRequestException('ai.image-download-failed', 'Unable to download image by URL.')
    }

    if (file.size > this.maxImageSizeBytes || file.buffer.length > this.maxImageSizeBytes) {
      throw new AppBadRequestException('ai.image-size-limit', 'Image exceeds maximum allowed size.', {
        maxBytes: this.maxImageSizeBytes,
      })
    }
  }

  private async downloadImageFromUrl(imageUrl: string): Promise<MulterFile> {
    const parsedUrl = await this.parseAndValidateExternalImageUrl(imageUrl)
    let lastError: unknown

    for (let attempt = 1; attempt <= this.imageDownloadAttempts; attempt++) {
      try {
        return await this.downloadImageFromUrlAttempt(parsedUrl)
      } catch (error) {
        lastError = error

        if (error instanceof AppBadRequestException && error.type !== 'bad-request.ai.image-download-failed') {
          throw error
        }
      }
    }

    if (lastError instanceof AppBadRequestException) {
      throw lastError
    }

    throw new AppBadRequestException('ai.image-download-failed', 'Unable to download image by URL.')
  }

  private async downloadImageFromUrlAttempt(url: URL): Promise<MulterFile> {
    const abortController = new AbortController()
    const timeout = setTimeout(() => abortController.abort(), this.imageDownloadTimeoutMs)

    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        signal: abortController.signal,
        headers: {
          Accept: 'image/*',
        },
      })

      if (response.status >= 300 && response.status < 400) {
        throw new AppBadRequestException('ai.image-url-forbidden', 'Provided imageUrl is forbidden.')
      }

      if (!response.ok) {
        throw new AppBadRequestException('ai.image-download-failed', 'Unable to download image by URL.', {
          statusCode: response.status,
        })
      }

      const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()

      if (!contentType.startsWith('image/')) {
        throw new AppBadRequestException('ai.image-content-type', 'Only image content type is supported.', {
          contentType,
        })
      }

      const contentLength = Number(response.headers.get('content-length'))

      if (Number.isFinite(contentLength) && contentLength > this.maxImageSizeBytes) {
        throw new AppBadRequestException('ai.image-size-limit', 'Image exceeds maximum allowed size.', {
          maxBytes: this.maxImageSizeBytes,
          contentLength,
        })
      }

      const buffer = Buffer.from(await response.arrayBuffer())

      if (buffer.length === 0) {
        throw new AppBadRequestException('ai.image-download-failed', 'Unable to download image by URL.')
      }

      if (buffer.length > this.maxImageSizeBytes) {
        throw new AppBadRequestException('ai.image-size-limit', 'Image exceeds maximum allowed size.', {
          maxBytes: this.maxImageSizeBytes,
        })
      }

      const fileName = extractRecipeFileNameFromUrl(url, contentType, `recipe-photo-${randomHash()}`)

      return {
        originalname: fileName,
        mimetype: contentType,
        buffer,
        size: buffer.length,
      } as MulterFile
    } catch (error) {
      if (error instanceof AppBadRequestException) {
        throw error
      }

      throw new AppBadRequestException('ai.image-download-failed', 'Unable to download image by URL.', {
        reason: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      clearTimeout(timeout)
    }
  }

  private async parseAndValidateExternalImageUrl(imageUrl: string): Promise<URL> {
    let parsedUrl: URL

    try {
      parsedUrl = new URL(imageUrl)
    } catch {
      throw new AppBadRequestException('ai.image-url-invalid', 'Provided imageUrl is invalid.')
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new AppBadRequestException('ai.image-url-invalid', 'Provided imageUrl is invalid.')
    }

    await this.assertHostIsAllowed(parsedUrl.hostname)

    return parsedUrl
  }

  private async assertHostIsAllowed(hostname: string): Promise<void> {
    const lowerHostname = hostname.toLowerCase()

    if (lowerHostname === 'localhost' || lowerHostname.endsWith('.local')) {
      throw new AppBadRequestException('ai.image-url-forbidden', 'Provided imageUrl is forbidden.')
    }

    const ipVersion = isIP(lowerHostname)

    if (ipVersion && this.isPrivateIpAddress(lowerHostname)) {
      throw new AppBadRequestException('ai.image-url-forbidden', 'Provided imageUrl is forbidden.')
    }

    if (ipVersion) {
      return
    }

    let addresses: Array<{ address: string }>

    try {
      addresses = await lookup(lowerHostname, { all: true, verbatim: true })
    } catch {
      throw new AppBadRequestException('ai.image-url-invalid', 'Provided imageUrl is invalid.')
    }

    if (addresses.length === 0) {
      throw new AppBadRequestException('ai.image-url-invalid', 'Provided imageUrl is invalid.')
    }

    const hasPrivateAddress = addresses.some((record) => this.isPrivateIpAddress(record.address))

    if (hasPrivateAddress) {
      throw new AppBadRequestException('ai.image-url-forbidden', 'Provided imageUrl is forbidden.')
    }
  }

  private isPrivateIpAddress(address: string): boolean {
    const version = isIP(address)

    if (version === 4) {
      return this.isPrivateIpv4(address)
    }

    if (version === 6) {
      return this.isPrivateIpv6(address)
    }

    return true
  }

  private isPrivateIpv4(address: string): boolean {
    const parts = address.split('.').map((part) => Number(part))

    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
      return true
    }

    const [a, b] = parts

    if (a === 10 || a === 127 || a === 0) {
      return true
    }

    if (a === 169 && b === 254) {
      return true
    }

    if (a === 172 && b >= 16 && b <= 31) {
      return true
    }

    if (a === 192 && b === 168) {
      return true
    }

    if (a === 100 && b >= 64 && b <= 127) {
      return true
    }

    if (a >= 224) {
      return true
    }

    return false
  }

  private isPrivateIpv6(address: string): boolean {
    const normalized = address.toLowerCase().split('%')[0]

    if (normalized === '::' || normalized === '::1') {
      return true
    }

    if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
      return true
    }

    if (
      normalized.startsWith('fe8') ||
      normalized.startsWith('fe9') ||
      normalized.startsWith('fea') ||
      normalized.startsWith('feb')
    ) {
      return true
    }

    if (normalized.startsWith('::ffff:')) {
      const ipv4Part = normalized.replace('::ffff:', '')
      return this.isPrivateIpv4(ipv4Part)
    }

    return false
  }

  private parseRecipeImageAnalysisPayload(payload: Prisma.JsonValue): RecipeImageAnalysisPayload {
    if (!isRecord(payload)) {
      throw new NonRetryableBackgroundJobError('Background job payload must be object.', {
        type: BackgroundJobType.RECIPE_IMAGE_ANALYSIS,
      })
    }

    const rawSourceLanguageId = payload.sourceLanguageId
    const rawImageUrl = payload.imageUrl
    const rawImageKey = payload.imageKey
    const rawPrompt = payload.prompt

    if (!isUuid(rawSourceLanguageId)) {
      throw new NonRetryableBackgroundJobError('Background job payload field "sourceLanguageId" is invalid.', {
        sourceLanguageId: rawSourceLanguageId,
      })
    }

    if (typeof rawImageUrl !== 'string' || rawImageUrl.trim().length === 0) {
      throw new NonRetryableBackgroundJobError('Background job payload field "imageUrl" is invalid.', {
        imageUrl: rawImageUrl,
      })
    }

    if (typeof rawImageKey !== 'string' || rawImageKey.trim().length === 0) {
      throw new NonRetryableBackgroundJobError('Background job payload field "imageKey" is invalid.', {
        imageKey: rawImageKey,
      })
    }

    return {
      sourceLanguageId: rawSourceLanguageId,
      imageUrl: rawImageUrl.trim(),
      imageKey: rawImageKey.trim(),
      prompt: typeof rawPrompt === 'string' ? rawPrompt : null,
    }
  }

  private parseRecipeImageGenerationPayload(payload: Prisma.JsonValue): RecipeImageGenerationPayload {
    if (!isRecord(payload)) {
      throw new NonRetryableBackgroundJobError('Background job payload must be object.', {
        type: BackgroundJobType.RECIPE_IMAGE_GENERATION,
      })
    }

    const rawRecipeId = payload.recipeId
    const rawLanguageId = payload.languageId
    const rawPrompt = payload.prompt

    if (!isUuid(rawRecipeId)) {
      throw new NonRetryableBackgroundJobError('Background job payload field "recipeId" is invalid.', {
        recipeId: rawRecipeId,
      })
    }

    if (!isUuid(rawLanguageId)) {
      throw new NonRetryableBackgroundJobError('Background job payload field "languageId" is invalid.', {
        languageId: rawLanguageId,
      })
    }

    return {
      recipeId: rawRecipeId,
      languageId: rawLanguageId,
      prompt: typeof rawPrompt === 'string' ? rawPrompt : null,
    }
  }

  private parseTranslationPayload(payload: Prisma.JsonValue): {
    recipeId: Uuid
    sourceLanguageId: Uuid
    targetLanguageId: Uuid
  } {
    if (!isRecord(payload)) {
      throw new NonRetryableBackgroundJobError('Background job payload must be object.', {
        type: BackgroundJobType.RECIPE_TRANSLATION,
      })
    }

    const rawRecipeId = payload.recipeId
    const rawSourceLanguageId = payload.sourceLanguageId
    const rawTargetLanguageId = payload.targetLanguageId

    if (!isUuid(rawRecipeId)) {
      throw new NonRetryableBackgroundJobError('Background job payload field "recipeId" is invalid.', {
        recipeId: rawRecipeId,
      })
    }

    if (!isUuid(rawSourceLanguageId)) {
      throw new NonRetryableBackgroundJobError('Background job payload field "sourceLanguageId" is invalid.', {
        sourceLanguageId: rawSourceLanguageId,
      })
    }

    if (!isUuid(rawTargetLanguageId)) {
      throw new NonRetryableBackgroundJobError('Background job payload field "targetLanguageId" is invalid.', {
        targetLanguageId: rawTargetLanguageId,
      })
    }

    return {
      recipeId: rawRecipeId,
      sourceLanguageId: rawSourceLanguageId,
      targetLanguageId: rawTargetLanguageId,
    }
  }

  private async generateRecipeFromPhoto(input: {
    imageUrl: string
    prompt?: string | null
    sourceLanguageCode: LanguageCode
  }): Promise<RecipeFromPhotoOutput> {
    const schema = {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'difficulty', 'cookingTimeMinutes', 'steps', 'ingredients'],
      properties: {
        title: { type: 'string' },
        description: { type: ['string', 'null'] },
        difficulty: {
          type: 'string',
          enum: [RecipeDifficultyKey.EASY, RecipeDifficultyKey.MEDIUM, RecipeDifficultyKey.HARD],
        },
        cookingTimeMinutes: { type: 'number' },
        servings: { type: ['number', 'null'] },
        steps: {
          type: 'array',
          items: { type: 'string' },
        },
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'quantity', 'measurementUnitKey'],
            properties: {
              name: { type: 'string' },
              quantity: { type: 'number' },
              measurementUnitKey: {
                type: 'string',
                enum: [
                  MeasurementUnitKey.G,
                  MeasurementUnitKey.KG,
                  MeasurementUnitKey.ML,
                  MeasurementUnitKey.L,
                  MeasurementUnitKey.PC,
                ],
              },
              note: { type: ['string', 'null'] },
            },
          },
        },
        nutrition: {
          type: ['object', 'null'],
          additionalProperties: false,
          properties: {
            kcal: { type: ['number', 'null'] },
            proteins: { type: ['number', 'null'] },
            fats: { type: ['number', 'null'] },
            carbs: { type: ['number', 'null'] },
            fiber: { type: ['number', 'null'] },
            sugar: { type: ['number', 'null'] },
            sodiumMg: { type: ['number', 'null'] },
          },
        },
      },
    }

    const userContent: GenerateStructuredJsonContentPart[] = [
      {
        type: 'text',
        text: [
          `Language: ${getLanguageLabelByCode(input.sourceLanguageCode)}.`,
          'Create realistic recipe draft from image with concise actionable steps.',
          'Use measurementUnitKey only from: G, KG, ML, L, PC.',
          `Extra context: ${input.prompt ?? 'No extra context provided.'}`,
        ].join('\n'),
      },
      {
        type: 'image_url',
        image_url: {
          url: input.imageUrl,
        },
      },
    ]

    const request: GenerateStructuredJsonInput = {
      schemaName: 'recipe_from_photo',
      schema,
      systemPrompt:
        'You are a professional culinary AI assistant. Analyze food photo and return ONLY JSON that matches schema.',
      userContent,
      mode: 'vision',
    }

    const response = await this.aiProvider.generateStructuredJson(request)
    return normalizeRecipeFromPhotoOutput(response, (message) => new NonRetryableBackgroundJobError(message))
  }

  private async translateRecipeFields(input: {
    sourceLanguageCode: LanguageCode
    targetLanguageCode: LanguageCode
    title: string
    description?: string | null
    steps: string[]
  }): Promise<{ title: string; description?: string | null; steps: string[] }> {
    const schema = {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'steps'],
      properties: {
        title: { type: 'string' },
        description: { type: ['string', 'null'] },
        steps: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    }

    const userContent: GenerateStructuredJsonContentPart[] = [
      {
        type: 'text',
        text: [
          `Translate recipe fields from ${getLanguageLabelByCode(input.sourceLanguageCode)} to ${getLanguageLabelByCode(input.targetLanguageCode)}.`,
          'Keep ingredient names and quantities semantically consistent.',
          `Title: ${input.title}`,
          `Description: ${input.description ?? ''}`,
          `Steps:\n${input.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`,
        ].join('\n\n'),
      },
    ]

    const request: GenerateStructuredJsonInput = {
      schemaName: 'recipe_translation',
      schema,
      systemPrompt:
        'You are a professional culinary translator. Return only a valid JSON object and keep cooking instructions concise and actionable.',
      userContent,
    }

    const response = await this.aiProvider.generateStructuredJson(request)

    return {
      title: normalizeRequiredString(response.title, 'title', (message) => new NonRetryableBackgroundJobError(message)),
      description: normalizeOptionalString(response.description),
      steps: normalizeStringArray(response.steps, 'steps', (message) => new NonRetryableBackgroundJobError(message)),
    }
  }

  private toPublicId(id: string): string {
    return isUuid(id) ? uuidToHash(id) : id
  }

  private async tryRemoveS3Object(key: string): Promise<void> {
    try {
      await this.awsBucketService.remove(key)
    } catch {
      return
    }
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

  private enforceRecipeImageAccess(authorId: Uuid, user: User): void {
    if (user.role === UserRole.ADMIN || user.id === authorId) {
      return
    }

    throw new AccessControlAuthorizationException('forbidden', 'Access denied. Please contact support.')
  }
}
