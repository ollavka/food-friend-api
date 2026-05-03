import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { MeasurementUnitKey, RecipeDifficultyKey, RecipeStatus } from '@prisma/client'
import { RecipeRepository } from './recipe.repository'

const RECIPE_ID = '11111111-1111-4111-8111-111111111111'
const USER_ID = '22222222-2222-4222-8222-222222222222'
const LANGUAGE_ID = '33333333-3333-4333-8333-333333333333'

describe('RecipeRepository', () => {
  const prismaService: any = {
    recipe: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    recipeTranslation: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    recipeStepTranslation: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    measurementUnit: {
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    recipeLike: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    recipeFavorite: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  let repository: RecipeRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new RecipeRepository(prismaService)
  })

  it('should query recipe by id with nested localized includes', async () => {
    prismaService.recipe.findUnique.mockResolvedValue({ id: RECIPE_ID })

    await repository.findRecipeById(RECIPE_ID as never, [LANGUAGE_ID] as never, USER_ID as never)

    expect(prismaService.recipe.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: RECIPE_ID },
      }),
    )
  })

  it('should find recipe access and image generation projections', async () => {
    await repository.findRecipeForAccess(RECIPE_ID as never)
    await repository.findRecipeForImageGenerationAccess(RECIPE_ID as never)

    expect(prismaService.recipe.findUnique).toHaveBeenNthCalledWith(1, {
      where: { id: RECIPE_ID },
      select: {
        id: true,
        authorId: true,
        status: true,
        publishedAt: true,
      },
    })
    expect(prismaService.recipe.findUnique).toHaveBeenNthCalledWith(2, {
      where: { id: RECIPE_ID },
      select: {
        id: true,
        authorId: true,
        status: true,
        imageKey: true,
      },
    })
  })

  it('should find recipe for translation and image generation', async () => {
    await repository.findRecipeForTranslation(
      RECIPE_ID as never,
      'source-language-id' as never,
      'target-language-id' as never,
    )
    await repository.findRecipeForImageGeneration(RECIPE_ID as never, ['l1', 'l2'] as never)

    expect(prismaService.recipe.findUnique).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: RECIPE_ID },
      }),
    )
    expect(prismaService.recipe.findUnique).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: RECIPE_ID },
      }),
    )
  })

  it('should update recipe image', async () => {
    await repository.updateRecipeImage(RECIPE_ID as never, { imageKey: 'key', imageUrl: 'url' } as never)

    expect(prismaService.recipe.update).toHaveBeenCalledWith({
      where: { id: RECIPE_ID },
      data: { imageKey: 'key', imageUrl: 'url' },
    })
  })

  it('should skip manual recipe translation update', async () => {
    prismaService.recipeTranslation.findUnique.mockResolvedValue({
      id: 'translation-id',
      isAutoTranslated: false,
    })

    const result = await repository.upsertRecipeTranslation(RECIPE_ID as never, LANGUAGE_ID as never, {
      title: 'Title',
    })

    expect(result).toEqual({
      updated: false,
      skippedManual: true,
      translation: {
        id: 'translation-id',
        isAutoTranslated: false,
      },
    })
  })

  it('should upsert recipe translation when auto-translated', async () => {
    prismaService.recipeTranslation.findUnique.mockResolvedValue({
      id: 'translation-id',
      isAutoTranslated: true,
    })
    prismaService.recipeTranslation.upsert.mockResolvedValue({
      id: 'translation-id',
    })

    const result = await repository.upsertRecipeTranslation(RECIPE_ID as never, LANGUAGE_ID as never, {
      title: 'Title',
      description: 'Description',
    })

    expect(prismaService.recipeTranslation.upsert).toHaveBeenCalled()
    expect(result).toEqual({
      updated: true,
      skippedManual: false,
      translation: { id: 'translation-id' },
    })
  })

  it('should skip manual recipe step translation update', async () => {
    prismaService.recipeStepTranslation.findUnique.mockResolvedValue({
      id: 'step-translation-id',
      isAutoTranslated: false,
    })

    const result = await repository.upsertRecipeStepTranslation(
      'step-id' as never,
      LANGUAGE_ID as never,
      'Step content',
    )

    expect(result).toEqual({
      updated: false,
      skippedManual: true,
      translation: {
        id: 'step-translation-id',
        isAutoTranslated: false,
      },
    })
  })

  it('should upsert recipe step translation when auto-translated', async () => {
    prismaService.recipeStepTranslation.findUnique.mockResolvedValue({
      id: 'step-translation-id',
      isAutoTranslated: true,
    })
    prismaService.recipeStepTranslation.upsert.mockResolvedValue({ id: 'step-translation-id' })

    const result = await repository.upsertRecipeStepTranslation(
      'step-id' as never,
      LANGUAGE_ID as never,
      'Step content',
    )

    expect(prismaService.recipeStepTranslation.upsert).toHaveBeenCalled()
    expect(result).toEqual({
      updated: true,
      skippedManual: false,
      translation: { id: 'step-translation-id' },
    })
  })

  it('should find measurement units by keys and map base type key', async () => {
    prismaService.measurementUnit.findMany.mockResolvedValue([
      {
        id: 'unit-id',
        key: MeasurementUnitKey.G,
        baseType: { key: 'MASS' },
      },
    ])

    const result = await repository.findMeasurementUnitsByKeys([MeasurementUnitKey.G])

    expect(result).toEqual([
      {
        id: 'unit-id',
        key: MeasurementUnitKey.G,
        baseTypeKey: 'MASS',
      },
    ])
  })

  it('should return empty product matches when names and slugs are empty', async () => {
    const result = await repository.findProductsForIngredientMatching(LANGUAGE_ID as never, USER_ID as never, [], [])

    expect(result).toEqual([])
    expect(prismaService.product.findMany).not.toHaveBeenCalled()
  })

  it('should find products for ingredient matching with maps', async () => {
    prismaService.product.findMany.mockResolvedValue([
      {
        id: 'product-id',
        slug: 'potato',
        translations: [{ name: 'Potato' }],
      },
    ])

    const result = await repository.findProductsForIngredientMatching(
      LANGUAGE_ID as never,
      USER_ID as never,
      ['Potato'],
      ['potato'],
    )

    expect(prismaService.product.findMany).toHaveBeenCalled()
    expect(result).toEqual([
      {
        id: 'product-id',
        slug: 'potato',
        translationName: 'Potato',
      },
    ])
  })

  it('should query recipe translation by language and count recipes', async () => {
    prismaService.recipeTranslation.findUnique.mockResolvedValue({ id: 'translation-id' })
    prismaService.recipe.count.mockResolvedValue(3)

    await repository.findRecipeTranslationByLanguage(RECIPE_ID as never, LANGUAGE_ID as never)
    const count = await repository.getTotalRecipesCount({ status: RecipeStatus.PUBLISHED })

    expect(prismaService.recipeTranslation.findUnique).toHaveBeenCalled()
    expect(count).toBe(3)
  })

  it('should query paginated recipe items', async () => {
    prismaService.recipe.findMany.mockResolvedValue([])

    await repository.getPaginatedRecipeItems(
      { status: RecipeStatus.PUBLISHED },
      { createdAt: 'desc' },
      0,
      10,
      [LANGUAGE_ID] as never,
      USER_ID as never,
    )

    expect(prismaService.recipe.findMany).toHaveBeenCalled()
  })

  it('should query recommendations and pantry recipes', async () => {
    prismaService.recipe.findMany.mockResolvedValue([])

    await repository.findRecipesForRecommendations(USER_ID as never, [LANGUAGE_ID] as never, {
      limit: 5,
      maxCookingTimeMinutes: 30,
      difficulty: RecipeDifficultyKey.EASY,
    })

    await repository.findRecipesForPantryMatch(USER_ID as never, ['product-id'] as never, [LANGUAGE_ID] as never)

    expect(prismaService.recipe.findMany).toHaveBeenCalledTimes(2)
  })

  it('should query substitutions source recipe and product candidates', async () => {
    prismaService.recipe.findUnique.mockResolvedValue({ id: RECIPE_ID })
    prismaService.product.findMany.mockResolvedValue([])

    await repository.findRecipeForSubstitutions(RECIPE_ID as never, [LANGUAGE_ID] as never)
    await repository.findProductsForSubstitutions(
      'measurement-base-type-id' as never,
      USER_ID as never,
      ['excluded-product-id'] as never,
      [LANGUAGE_ID] as never,
      5,
    )

    expect(prismaService.recipe.findUnique).toHaveBeenCalled()
    expect(prismaService.product.findMany).toHaveBeenCalled()
  })

  it('should prepare where and sort inputs', () => {
    const where = repository.prepareRecipeWhereInput(
      {
        difficulty: RecipeDifficultyKey.HARD,
        search: 'soup',
        status: RecipeStatus.PUBLISHED,
      } as never,
      [LANGUAGE_ID] as never,
    )

    expect(where).toEqual({
      status: RecipeStatus.PUBLISHED,
      difficulty: {
        key: RecipeDifficultyKey.HARD,
      },
      OR: [
        {
          slug: {
            contains: 'soup',
            mode: 'insensitive',
          },
        },
        {
          translations: {
            some: {
              languageId: {
                in: [LANGUAGE_ID],
              },
              OR: [
                {
                  title: {
                    contains: 'soup',
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    contains: 'soup',
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        },
      ],
    })

    expect(repository.prepareRecipeSortInput()).toEqual({ createdAt: 'desc' })
    expect(repository.prepareRecipeSortInput({ field: 'publishedAt', order: 'asc' } as never)).toEqual({
      publishedAt: 'asc',
    })
  })

  it('should find products and measurement units by ids', async () => {
    prismaService.product.findMany.mockResolvedValue([{ id: 'product-id', measurementBaseTypeId: 'base-id' }])
    prismaService.measurementUnit.findMany.mockResolvedValue([{ id: 'unit-id', baseTypeId: 'base-id' }])

    const products = await repository.findProductsByIds(['product-id'] as never)
    const units = await repository.findMeasurementUnitsByIds(['unit-id'] as never)

    expect(products).toEqual([{ id: 'product-id', measurementBaseTypeId: 'base-id' }])
    expect(units).toEqual([{ id: 'unit-id', baseTypeId: 'base-id' }])
  })

  it('should create and update recipe', async () => {
    await repository.createRecipe({ slug: 'recipe' } as never)
    await repository.updateRecipe(RECIPE_ID as never, { slug: 'updated' } as never)

    expect(prismaService.recipe.create).toHaveBeenCalledWith({
      data: {
        slug: 'recipe',
      },
    })
    expect(prismaService.recipe.update).toHaveBeenCalledWith({
      where: { id: RECIPE_ID },
      data: {
        slug: 'updated',
      },
    })
  })

  it('should create and remove likes/favorites with boolean result', async () => {
    prismaService.recipeLike.createMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 })
    prismaService.recipeLike.deleteMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 })
    prismaService.recipeFavorite.createMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 })
    prismaService.recipeFavorite.deleteMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 })

    await expect(repository.createRecipeLikeIfNotExists(RECIPE_ID as never, USER_ID as never)).resolves.toBe(true)
    await expect(repository.createRecipeLikeIfNotExists(RECIPE_ID as never, USER_ID as never)).resolves.toBe(false)
    await expect(repository.removeRecipeLike(RECIPE_ID as never, USER_ID as never)).resolves.toBe(true)
    await expect(repository.removeRecipeLike(RECIPE_ID as never, USER_ID as never)).resolves.toBe(false)
    await expect(repository.createRecipeFavoriteIfNotExists(RECIPE_ID as never, USER_ID as never)).resolves.toBe(true)
    await expect(repository.createRecipeFavoriteIfNotExists(RECIPE_ID as never, USER_ID as never)).resolves.toBe(false)
    await expect(repository.removeRecipeFavorite(RECIPE_ID as never, USER_ID as never)).resolves.toBe(true)
    await expect(repository.removeRecipeFavorite(RECIPE_ID as never, USER_ID as never)).resolves.toBe(false)
  })

  it('should increment and decrement counters', async () => {
    await repository.incrementRecipeLikes(RECIPE_ID as never)
    await repository.decrementRecipeLikes(RECIPE_ID as never)
    await repository.incrementRecipeFavorites(RECIPE_ID as never)
    await repository.decrementRecipeFavorites(RECIPE_ID as never)
    await repository.incrementRecipeViews(RECIPE_ID as never)

    expect(prismaService.recipe.update).toHaveBeenCalledTimes(5)
  })

  it('should check recipe slug existence', async () => {
    prismaService.recipe.findUnique.mockResolvedValueOnce({ id: RECIPE_ID }).mockResolvedValueOnce(null)

    await expect(repository.isRecipeSlugExists('recipe-slug')).resolves.toBe(true)
    await expect(repository.isRecipeSlugExists('missing-slug')).resolves.toBe(false)
  })
})
