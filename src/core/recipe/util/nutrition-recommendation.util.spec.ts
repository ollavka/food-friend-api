import { describe, expect, it } from '@jest/globals'
import { NutritionActivityLevel, NutritionGoal, NutritionSex } from '@prisma/client'
import { uuidToHash } from '@common/util'
import {
  calculateDailyCaloriesTarget,
  calculateDailyProteinsTarget,
  calculateRecommendationScore,
  normalizeExplanationItems,
  normalizePantryItems,
} from './nutrition-recommendation.util'

const PRODUCT_ID = '11111111-1111-4111-8111-111111111111'
const UNIT_ID = '22222222-2222-4222-8222-222222222222'

describe('nutrition recommendation util', () => {
  it('should normalize pantry items and aggregate quantity by product+unit', () => {
    const normalized = normalizePantryItems([
      {
        productId: uuidToHash(PRODUCT_ID),
        measurementUnitId: uuidToHash(UNIT_ID),
        quantity: 1,
      },
      {
        productId: uuidToHash(PRODUCT_ID),
        measurementUnitId: uuidToHash(UNIT_ID),
        quantity: 2,
      },
      {
        productId: 'invalid-hash',
      },
    ])

    expect(normalized.productIds).toEqual([PRODUCT_ID])
    expect(normalized.productIdSet.has(PRODUCT_ID)).toBe(true)
    expect(normalized.quantityByProductUnit.size).toBe(1)
    expect([...normalized.quantityByProductUnit.values()][0]).toBe(3)
  })

  it('should calculate calorie and proteins targets', () => {
    const calories = calculateDailyCaloriesTarget({
      sex: NutritionSex.MALE,
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activityLevel: NutritionActivityLevel.MODERATE,
      goal: NutritionGoal.MAINTAIN_WEIGHT,
    })

    expect(calories).toBeGreaterThan(1200)

    expect(calculateDailyProteinsTarget({ weightKg: 80, goal: NutritionGoal.LOSE_WEIGHT })).toBe(144)
    expect(calculateDailyProteinsTarget({ weightKg: 80, goal: NutritionGoal.GAIN_WEIGHT })).toBe(160)
    expect(calculateDailyProteinsTarget({ weightKg: 80, goal: NutritionGoal.MAINTAIN_WEIGHT })).toBe(128)
  })

  it('should calculate recommendation score in range 0..100', () => {
    const score = calculateRecommendationScore({
      targetCaloriesPerServing: 500,
      targetProteinsPerServing: 30,
      caloriesDelta: 50,
      proteinsDelta: 3,
    })

    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('should normalize explanation items and deduplicate by id', () => {
    const items = normalizeExplanationItems(
      [
        { recipeId: 'a', reason: 'first' },
        { recipeId: 'a', reason: 'duplicate' },
        { recipeId: 'b', reason: 'second' },
        { productId: 'x', reason: 'ignored' },
      ],
      'recipeId',
    )

    expect(items).toEqual([
      { id: 'a', reason: 'first' },
      { id: 'b', reason: 'second' },
    ])
  })
})
