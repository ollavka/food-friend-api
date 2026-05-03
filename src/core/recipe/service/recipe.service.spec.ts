import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import {
  LanguageCode,
  NutritionActivityLevel,
  NutritionGoal,
  NutritionSex,
  RecipeDifficultyKey,
  RecipeStatus,
  UserRole,
} from '@prisma/client'
import { uuidToHash } from '@common/util'
import { RecipeService } from './recipe.service'

const LANGUAGE_EN_ID = '11111111-1111-4111-8111-111111111111'
const LANGUAGE_UK_ID = '22222222-2222-4222-8222-222222222222'
const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const OTHER_USER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

function createRecipeEntity(overrides: Record<string, unknown> = {}): any {
  const now = new Date('2026-01-01T00:00:00.000Z')

  return {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    slug: 'test-recipe',
    status: RecipeStatus.PUBLISHED,
    cookingTimeMinutes: 30,
    servings: 2,
    imageUrl: null,
    likesCount: 0,
    favoritesCount: 0,
    viewsCount: 0,
    createdAt: now,
    updatedAt: now,
    translations: [
      {
        languageId: LANGUAGE_EN_ID,
        title: 'Test recipe',
        description: 'Tasty and simple',
      },
    ],
    difficulty: {
      key: RecipeDifficultyKey.MEDIUM,
      translations: [
        {
          languageId: LANGUAGE_EN_ID,
          label: 'Medium',
        },
      ],
    },
    author: {
      id: USER_ID,
      firstName: 'Test',
      lastName: 'User',
    },
    likes: [],
    favorites: [],
    nutrition: {
      kcal: 1200,
      proteins: 60,
      fats: 40,
      carbs: 130,
      fiber: null,
      sugar: null,
      sodiumMg: null,
      isEstimated: false,
      updatedByAiAt: null,
    },
    ingredients: [],
    ...overrides,
  }
}

describe('RecipeService', () => {
  const recipeRepository: any = {
    findRecipesForRecommendations: jest.fn(),
    findRecipesForPantryMatch: jest.fn(),
    findRecipeForSubstitutions: jest.fn(),
    findProductsForSubstitutions: jest.fn(),
  }

  const recipeDifficultyService: any = {
    getRecipeDifficultyByKey: jest.fn(),
  }

  const languageService: any = {
    getLanguageOrDefault: jest.fn(),
    getDefaultLanguage: jest.fn(),
  }

  const searchService: any = {
    enqueueRecipeSyncJob: jest.fn(),
  }

  const userService: any = {
    getNutritionProfileByUserId: jest.fn(),
  }

  const paginationService: any = {
    paginate: jest.fn(),
  }

  const prismaService: any = {
    $transaction: jest.fn(),
  }

  const aiProvider: any = {
    generateStructuredJson: jest.fn(),
  }

  let recipeService: RecipeService

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

    recipeService = new RecipeService(
      recipeRepository as never,
      recipeDifficultyService as never,
      languageService as never,
      searchService as never,
      userService as never,
      paginationService as never,
      prismaService as never,
      aiProvider as never,
    )
  })

  it('should return recommendations in deterministic order by score', async () => {
    userService.getNutritionProfileByUserId.mockResolvedValue({
      sex: NutritionSex.MALE,
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activityLevel: NutritionActivityLevel.MODERATE,
      goal: NutritionGoal.MAINTAIN_WEIGHT,
      targetCalories: 2100,
    })

    const highMatchRecipeId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
    const lowMatchRecipeId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'

    recipeRepository.findRecipesForRecommendations.mockResolvedValue([
      createRecipeEntity({
        id: highMatchRecipeId,
        servings: 3,
        nutrition: {
          kcal: 2100,
          proteins: 129,
        },
      }),
      createRecipeEntity({
        id: lowMatchRecipeId,
        servings: 3,
        nutrition: {
          kcal: 1200,
          proteins: 30,
        },
      }),
    ])

    aiProvider.generateStructuredJson.mockResolvedValue({
      items: [
        {
          recipeId: highMatchRecipeId,
          reason: 'Best fit for daily kcal and protein target.',
        },
        {
          recipeId: lowMatchRecipeId,
          reason: 'Lower calories than target.',
        },
      ],
    })

    const result = await recipeService.getRecipeRecommendations(
      {
        id: USER_ID,
        role: UserRole.REGULAR,
      } as never,
      LanguageCode.EN,
      {
        limit: 10,
      },
    )

    expect(result.items).toHaveLength(2)
    expect(result.items[0].recipe.id).toBe(highMatchRecipeId)
    expect(result.items[0].score).toBeGreaterThan(result.items[1].score)
    expect(result.items[0].reason).toBe('Best fit for daily kcal and protein target.')
  })

  it('should return reason=null when AI explanation is unavailable', async () => {
    userService.getNutritionProfileByUserId.mockResolvedValue({
      sex: NutritionSex.FEMALE,
      age: 27,
      heightCm: 170,
      weightKg: 62,
      activityLevel: NutritionActivityLevel.LIGHT,
      goal: NutritionGoal.LOSE_WEIGHT,
      targetCalories: 1700,
    })

    recipeRepository.findRecipesForRecommendations.mockResolvedValue([createRecipeEntity()])
    aiProvider.generateStructuredJson.mockRejectedValue(new Error('timeout'))

    const result = await recipeService.getRecipeRecommendations(
      {
        id: USER_ID,
        role: UserRole.REGULAR,
      } as never,
      LanguageCode.EN,
      {},
    )

    expect(result.items).toHaveLength(1)
    expect(result.items[0].reason).toBeNull()
  })

  it('should calculate pantry coverage and quantity sufficiency only for matching product+unit pair', async () => {
    const matchedProductId = 'f1f1f1f1-f1f1-4f1f-8f1f-f1f1f1f1f1f1'
    const missingProductId = 'a2a2a2a2-a2a2-4a2a-8a2a-a2a2a2a2a2a2'
    const gramsUnitId = 'b3b3b3b3-b3b3-4b3b-8b3b-b3b3b3b3b3b3'

    recipeRepository.findRecipesForPantryMatch.mockResolvedValue([
      createRecipeEntity({
        ingredients: [
          {
            productId: matchedProductId,
            measurementUnitId: gramsUnitId,
            quantity: 300,
            product: {
              slug: 'potato',
              translations: [{ languageId: LANGUAGE_EN_ID, name: 'Potato' }],
            },
            measurementUnit: {
              key: 'G',
              translations: [{ languageId: LANGUAGE_EN_ID, label: 'g' }],
            },
          },
          {
            productId: missingProductId,
            measurementUnitId: gramsUnitId,
            quantity: 200,
            product: {
              slug: 'carrot',
              translations: [{ languageId: LANGUAGE_EN_ID, name: 'Carrot' }],
            },
            measurementUnit: {
              key: 'G',
              translations: [{ languageId: LANGUAGE_EN_ID, label: 'g' }],
            },
          },
        ],
      }),
    ])

    const result = await recipeService.getPantryMatchRecipes(
      {
        id: USER_ID,
        role: UserRole.REGULAR,
      } as never,
      LanguageCode.EN,
      {
        items: [
          {
            productId: uuidToHash(matchedProductId),
            measurementUnitId: uuidToHash(gramsUnitId),
            quantity: 350,
          },
        ],
      },
    )

    expect(result.items).toHaveLength(1)
    expect(result.items[0].coveragePercent).toBe(50)
    expect(result.items[0].matchedIngredientsCount).toBe(1)
    expect(result.items[0].quantitySufficientCount).toBe(1)
    expect(result.items[0].missingIngredients).toHaveLength(1)
    expect(result.items[0].missingIngredients[0].productId).toBe(missingProductId)
  })

  it('should rank substitutions with system-first policy and return reason=null on fallback', async () => {
    const recipeId = 'c4c4c4c4-c4c4-4c4c-8c4c-c4c4c4c4c4c4'
    const ingredientProductId = 'd5d5d5d5-d5d5-4d5d-8d5d-d5d5d5d5d5d5'
    const replacementSystemId = 'e6e6e6e6-e6e6-4e6e-8e6e-e6e6e6e6e6e6'
    const replacementUserId = 'f7f7f7f7-f7f7-4f7f-8f7f-f7f7f7f7f7f7'

    recipeRepository.findRecipeForSubstitutions.mockResolvedValue(
      createRecipeEntity({
        id: recipeId,
        authorId: OTHER_USER_ID,
        status: RecipeStatus.PUBLISHED,
        ingredients: [
          {
            productId: ingredientProductId,
            product: {
              slug: 'chicken-breast',
              measurementBaseTypeId: 'base-type-1',
              translations: [{ languageId: LANGUAGE_EN_ID, name: 'Chicken breast' }],
            },
            measurementUnit: {
              key: 'G',
              translations: [{ languageId: LANGUAGE_EN_ID, label: 'g' }],
            },
          },
        ],
      }),
    )

    recipeRepository.findProductsForSubstitutions.mockResolvedValue([
      {
        id: replacementUserId,
        slug: 'tofu',
        isSystem: false,
        translations: [{ languageId: LANGUAGE_EN_ID, name: 'Tofu' }],
        measurementUnit: {
          key: 'G',
          translations: [{ languageId: LANGUAGE_EN_ID, label: 'g' }],
        },
        _count: {
          recipeIngredients: 20,
        },
      },
      {
        id: replacementSystemId,
        slug: 'turkey-fillet',
        isSystem: true,
        translations: [{ languageId: LANGUAGE_EN_ID, name: 'Turkey fillet' }],
        measurementUnit: {
          key: 'G',
          translations: [{ languageId: LANGUAGE_EN_ID, label: 'g' }],
        },
        _count: {
          recipeIngredients: 5,
        },
      },
    ])
    aiProvider.generateStructuredJson.mockRejectedValue(new Error('provider unavailable'))

    const result = await recipeService.getRecipeSubstitutions(
      recipeId,
      {
        id: USER_ID,
        role: UserRole.REGULAR,
      } as never,
      LanguageCode.EN,
      {
        ingredientProductId: uuidToHash(ingredientProductId),
      },
    )

    expect(result.items).toHaveLength(2)
    expect(result.items[0].productId).toBe(replacementSystemId)
    expect(result.items[0].reason).toBeNull()
    expect(result.items[1].reason).toBeNull()
  })
})
