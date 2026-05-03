import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BackgroundJobStatus, BackgroundJobType, RecipeStatus, UserRole } from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { AppBadRequestException, AppEntityNotFoundException } from '@common/exception'
import { uuidToHash } from '@common/util'
import { RecipeAiService } from './recipe-ai.service'

const USER_ID = '11111111-1111-4111-8111-111111111111'
const LANGUAGE_ID = '22222222-2222-4222-8222-222222222222'
const RECIPE_ID = '33333333-3333-4333-8333-333333333333'
const RECIPE_HASH_ID = uuidToHash(RECIPE_ID)

describe('RecipeAiService', () => {
  const recipeRepository: any = {
    findRecipeForImageGenerationAccess: jest.fn(),
    findRecipeForImageGeneration: jest.fn(),
    updateRecipeImage: jest.fn(),
  }

  const recipeService: any = {
    createRecipe: jest.fn(),
  }

  const productService: any = {
    createProduct: jest.fn(),
  }

  const userService: any = {
    findById: jest.fn(),
  }

  const languageService: any = {
    getLanguageOrDefault: jest.fn(),
    getLanguageById: jest.fn(),
    getDefaultLanguage: jest.fn(),
  }

  const searchService: any = {
    enqueueRecipeSyncJob: jest.fn(),
  }

  const prismaService: any = {
    backgroundJob: {
      create: jest.fn(),
    },
  }

  const awsBucketService: any = {
    upload: jest.fn(),
    remove: jest.fn(),
  }

  const aiProvider: any = {
    generateStructuredJson: jest.fn(),
    generateImage: jest.fn(),
  }

  let service: RecipeAiService

  beforeEach(() => {
    jest.clearAllMocks()

    languageService.getLanguageOrDefault.mockResolvedValue({ id: LANGUAGE_ID, code: 'EN' })
    languageService.getLanguageById.mockResolvedValue({ id: LANGUAGE_ID, code: 'EN' })
    languageService.getDefaultLanguage.mockResolvedValue({
      id: '44444444-4444-4444-8444-444444444444',
      code: 'UK',
    })
    recipeRepository.updateRecipeImage.mockResolvedValue(undefined)
    searchService.enqueueRecipeSyncJob.mockResolvedValue(undefined)
    awsBucketService.remove.mockResolvedValue(undefined)

    service = new RecipeAiService(
      recipeRepository,
      recipeService,
      productService,
      userService,
      languageService,
      searchService,
      prismaService,
      awsBucketService,
      aiProvider,
    )
  })

  it('should throw when createRecipeFromPhotoJob has no photo source', async () => {
    await expect(
      service.createRecipeFromPhotoJob(
        { id: USER_ID, role: UserRole.REGULAR } as never,
        'EN' as never,
        {} as never,
        undefined,
      ),
    ).rejects.toBeInstanceOf(AppBadRequestException)
  })

  it('should create recipe-from-photo background job for uploaded file', async () => {
    awsBucketService.upload.mockResolvedValue({
      key: 'recipes/source/file.jpg',
      url: 'https://s3.aws/recipes/source/file.jpg',
    })

    prismaService.backgroundJob.create.mockResolvedValue({
      id: 'job-1',
      type: 'RECIPE_IMAGE_ANALYSIS',
      status: 'PENDING',
      attempts: 0,
      maxAttempts: 3,
      runAt: new Date(),
      startedAt: null,
      finishedAt: null,
      result: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.createRecipeFromPhotoJob(
      { id: USER_ID, role: UserRole.REGULAR } as never,
      'EN' as never,
      {} as never,
      {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('photo-data'),
        size: 9,
      } as never,
    )

    expect(result.id).toBe('job-1')
    expect(awsBucketService.upload).toHaveBeenCalled()
    expect(prismaService.backgroundJob.create).toHaveBeenCalled()
  })

  it('should validate recipe image generation access rules', async () => {
    await expect(
      service.createRecipeImageJob({ id: USER_ID, role: UserRole.REGULAR } as never, 'EN' as never, {} as never),
    ).rejects.toBeInstanceOf(AppBadRequestException)

    recipeRepository.findRecipeForImageGenerationAccess.mockResolvedValueOnce(null)

    await expect(
      service.createRecipeImageJob(
        { id: USER_ID, role: UserRole.REGULAR } as never,
        'EN' as never,
        { recipeId: RECIPE_HASH_ID } as never,
      ),
    ).rejects.toBeInstanceOf(AppEntityNotFoundException)

    recipeRepository.findRecipeForImageGenerationAccess.mockResolvedValueOnce({
      id: RECIPE_ID,
      authorId: 'other-user',
      status: RecipeStatus.PUBLISHED,
    })

    await expect(
      service.createRecipeImageJob(
        { id: USER_ID, role: UserRole.REGULAR } as never,
        'EN' as never,
        { recipeId: RECIPE_HASH_ID } as never,
      ),
    ).rejects.toBeInstanceOf(AccessControlAuthorizationException)

    recipeRepository.findRecipeForImageGenerationAccess.mockResolvedValueOnce({
      id: RECIPE_ID,
      authorId: USER_ID,
      status: RecipeStatus.ARCHIVED,
    })

    await expect(
      service.createRecipeImageJob(
        { id: USER_ID, role: UserRole.REGULAR } as never,
        'EN' as never,
        { recipeId: RECIPE_HASH_ID } as never,
      ),
    ).rejects.toBeInstanceOf(AppBadRequestException)
  })

  it('should create recipe image generation job when access is allowed', async () => {
    recipeRepository.findRecipeForImageGenerationAccess.mockResolvedValue({
      id: RECIPE_ID,
      authorId: USER_ID,
      status: RecipeStatus.PUBLISHED,
    })

    prismaService.backgroundJob.create.mockResolvedValue({
      id: 'job-2',
      type: BackgroundJobType.RECIPE_IMAGE_GENERATION,
      status: BackgroundJobStatus.PENDING,
      attempts: 0,
      maxAttempts: 3,
      runAt: new Date(),
      startedAt: null,
      finishedAt: null,
      result: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.createRecipeImageJob(
      { id: USER_ID, role: UserRole.REGULAR } as never,
      'EN' as never,
      { recipeId: RECIPE_HASH_ID, prompt: 'natural light' } as never,
    )

    expect(result.id).toBe('job-2')
    expect(prismaService.backgroundJob.create).toHaveBeenCalled()
  })

  it('should process recipe image generation job successfully', async () => {
    recipeRepository.findRecipeForImageGeneration.mockResolvedValue({
      id: RECIPE_ID,
      status: RecipeStatus.PUBLISHED,
      imageKey: 'recipes/generated/old-image.png',
      translations: [{ languageId: LANGUAGE_ID, title: 'Soup', description: 'Tasty soup' }],
      steps: [{ translations: [{ languageId: LANGUAGE_ID, content: 'Boil water' }] }],
    })
    aiProvider.generateImage.mockResolvedValue({
      mimeType: 'image/png',
      buffer: Buffer.from('image-bytes'),
      providerMeta: { model: 'gpt-image-1' },
    })
    awsBucketService.upload.mockResolvedValue({
      key: 'recipes/generated/new-image.png',
      url: 'https://cdn/new-image.png',
    })

    const result = await service.handleRecipeImageGenerationJob({
      id: 'job-id',
      type: BackgroundJobType.RECIPE_IMAGE_GENERATION,
      status: BackgroundJobStatus.PROCESSING,
      attempts: 1,
      maxAttempts: 3,
      runAt: new Date(),
      payload: {
        recipeId: RECIPE_ID,
        languageId: LANGUAGE_ID,
        prompt: 'cozy plating',
      },
      userId: USER_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    expect(recipeRepository.updateRecipeImage).toHaveBeenCalledWith(RECIPE_ID, {
      imageKey: 'recipes/generated/new-image.png',
      imageUrl: 'https://cdn/new-image.png',
    })
    expect(searchService.enqueueRecipeSyncJob).toHaveBeenCalledWith(RECIPE_ID, USER_ID, 'UPSERT')
    expect(awsBucketService.remove).toHaveBeenCalledWith('recipes/generated/old-image.png')
    expect(result).toEqual(
      expect.objectContaining({
        type: BackgroundJobType.RECIPE_IMAGE_GENERATION,
        deletedPreviousImage: true,
      }),
    )
  })

  it('should cleanup new S3 object when DB update fails', async () => {
    recipeRepository.findRecipeForImageGeneration.mockResolvedValue({
      id: RECIPE_ID,
      status: RecipeStatus.PUBLISHED,
      imageKey: null,
      translations: [{ languageId: LANGUAGE_ID, title: 'Soup', description: null }],
      steps: [],
    })
    aiProvider.generateImage.mockResolvedValue({
      mimeType: 'image/png',
      buffer: Buffer.from('image-bytes'),
      providerMeta: null,
    })
    awsBucketService.upload.mockResolvedValue({
      key: 'recipes/generated/new-image.png',
      url: 'https://cdn/new-image.png',
    })
    recipeRepository.updateRecipeImage.mockRejectedValue(new Error('db failure'))

    await expect(
      service.handleRecipeImageGenerationJob({
        id: 'job-id',
        type: BackgroundJobType.RECIPE_IMAGE_GENERATION,
        status: BackgroundJobStatus.PROCESSING,
        attempts: 1,
        maxAttempts: 3,
        runAt: new Date(),
        payload: {
          recipeId: RECIPE_ID,
          languageId: LANGUAGE_ID,
        },
        userId: USER_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never),
    ).rejects.toThrow('db failure')

    expect(awsBucketService.remove).toHaveBeenCalledWith('recipes/generated/new-image.png')
  })

  it('should append warning when previous image cleanup fails', async () => {
    recipeRepository.findRecipeForImageGeneration.mockResolvedValue({
      id: RECIPE_ID,
      status: RecipeStatus.PUBLISHED,
      imageKey: 'recipes/generated/old-image.png',
      translations: [{ languageId: LANGUAGE_ID, title: 'Soup', description: null }],
      steps: [],
    })
    aiProvider.generateImage.mockResolvedValue({
      mimeType: 'image/png',
      buffer: Buffer.from('image-bytes'),
      providerMeta: null,
    })
    awsBucketService.upload.mockResolvedValue({
      key: 'recipes/generated/new-image.png',
      url: 'https://cdn/new-image.png',
    })
    recipeRepository.updateRecipeImage.mockResolvedValue(undefined)
    awsBucketService.remove.mockRejectedValue(new Error('s3 remove error'))

    const result = await service.handleRecipeImageGenerationJob({
      id: 'job-id',
      type: BackgroundJobType.RECIPE_IMAGE_GENERATION,
      status: BackgroundJobStatus.PROCESSING,
      attempts: 1,
      maxAttempts: 3,
      runAt: new Date(),
      payload: {
        recipeId: RECIPE_ID,
        languageId: LANGUAGE_ID,
      },
      userId: USER_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    expect(result).toEqual(
      expect.objectContaining({
        deletedPreviousImage: false,
        warnings: ['Failed to delete previous recipe image from S3.'],
      }),
    )
  })

  it('should reject invalid payloads in private parsers', () => {
    expect(() => (service as any).parseRecipeImageAnalysisPayload('invalid')).toThrow()
    expect(() => (service as any).parseRecipeImageGenerationPayload('invalid')).toThrow()
    expect(() => (service as any).parseTranslationPayload('invalid')).toThrow()
  })

  it('should normalize nutrition input and fallback steps in draft dto', () => {
    const dto = (service as any).buildRecipeFromPhotoCreateDto(
      {
        title: 'Recipe title',
        description: 'Recipe description',
        difficulty: 'EASY',
        cookingTimeMinutes: 25.6,
        servings: 2.2,
        steps: [],
        ingredients: [],
        nutrition: {
          kcal: 450,
          proteins: null,
          fats: 10,
          carbs: 20,
          fiber: null,
          sugar: null,
          sodiumMg: null,
        },
      },
      {
        imageUrl: 'https://cdn/image.png',
        imageKey: 'recipes/source/image.png',
      },
      [
        {
          productId: USER_ID,
          measurementUnitId: LANGUAGE_ID,
          quantity: 100,
          note: 'note',
        },
      ],
    )

    expect(dto.steps).toEqual([{ content: 'Prepare ingredients and cook until ready.' }])
    expect(dto.nutrition).toEqual({
      kcal: 450,
      fats: 10,
      carbs: 20,
      isEstimated: true,
    })
  })

  it('should validate image URL security and network helper branches', async () => {
    await expect((service as any).parseAndValidateExternalImageUrl('not-a-url')).rejects.toBeInstanceOf(
      AppBadRequestException,
    )
    await expect(
      (service as any).parseAndValidateExternalImageUrl('ftp://example.com/image.png'),
    ).rejects.toBeInstanceOf(AppBadRequestException)
    await expect((service as any).assertHostIsAllowed('localhost')).rejects.toBeInstanceOf(AppBadRequestException)

    expect((service as any).isPrivateIpv4('127.0.0.1')).toBe(true)
    expect((service as any).isPrivateIpv4('8.8.8.8')).toBe(false)
    expect((service as any).isPrivateIpv6('::1')).toBe(true)
    expect((service as any).isPrivateIpv6('2001:4860:4860::8888')).toBe(false)
  })

  it('should enforce recipe image access for admin and owner only', () => {
    expect(() =>
      (service as any).enforceRecipeImageAccess(USER_ID, {
        id: 'admin-user-id',
        role: UserRole.ADMIN,
      }),
    ).not.toThrow()

    expect(() =>
      (service as any).enforceRecipeImageAccess(USER_ID, {
        id: USER_ID,
        role: UserRole.REGULAR,
      }),
    ).not.toThrow()

    expect(() =>
      (service as any).enforceRecipeImageAccess(USER_ID, {
        id: 'another-user-id',
        role: UserRole.REGULAR,
      }),
    ).toThrow(AccessControlAuthorizationException)
  })
})
