import { NutritionActivityLevel, NutritionGoal, NutritionSex } from '@prisma/client'
import { Uuid } from '@common/type'
import { buildCompositeKey, hashToUuid, isRecord, isUuid } from '@common/util'

export type PantryItemInput = {
  productId: string
  quantity?: number
  measurementUnitId?: string
}

export type NormalizedPantryItems = {
  productIds: Uuid[]
  productIdSet: Set<Uuid>
  quantityByProductUnit: Map<string, number>
}

export type NutritionProfileInput = {
  sex: NutritionSex
  age: number
  heightCm: number
  weightKg: number
  activityLevel: NutritionActivityLevel
  goal: NutritionGoal
}

export type RecommendationMatchMetaInput = {
  targetCaloriesPerServing: number
  targetProteinsPerServing: number
  caloriesDelta: number
  proteinsDelta?: number | null
}

export function normalizePantryItems(items: PantryItemInput[]): NormalizedPantryItems {
  const productIdSet = new Set<Uuid>()
  const quantityByProductUnit = new Map<string, number>()

  for (const item of items) {
    const productId = <Uuid>hashToUuid(item.productId)

    if (!isUuid(productId)) {
      continue
    }

    productIdSet.add(productId)

    if (item.quantity === undefined || item.measurementUnitId === undefined) {
      continue
    }

    const measurementUnitId = <Uuid>hashToUuid(item.measurementUnitId)

    if (!isUuid(measurementUnitId)) {
      continue
    }

    const quantity = Number(item.quantity)

    if (!Number.isFinite(quantity) || quantity < 0) {
      continue
    }

    const key = buildCompositeKey(productId, measurementUnitId)
    const currentQuantity = quantityByProductUnit.get(key) ?? 0
    quantityByProductUnit.set(key, currentQuantity + quantity)
  }

  return {
    productIds: [...productIdSet],
    productIdSet,
    quantityByProductUnit,
  }
}

export function calculateDailyCaloriesTarget(profile: NutritionProfileInput): number {
  const sexOffset = profile.sex === NutritionSex.MALE ? 5 : -161
  const bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + sexOffset
  const tdee = bmr * getActivityMultiplier(profile.activityLevel)
  const calories = tdee + getGoalCaloriesAdjustment(profile.goal)

  return Math.max(1200, Math.round(calories))
}

export function calculateDailyProteinsTarget(profile: { weightKg: number; goal: NutritionGoal }): number {
  switch (profile.goal) {
    case NutritionGoal.LOSE_WEIGHT:
      return profile.weightKg * 1.8
    case NutritionGoal.GAIN_WEIGHT:
      return profile.weightKg * 2
    case NutritionGoal.MAINTAIN_WEIGHT:
    default:
      return profile.weightKg * 1.6
  }
}

export function calculateRecommendationScore(matchMeta: RecommendationMatchMetaInput): number {
  const caloriesWeight = 0.7
  const proteinsWeight = 0.3
  const caloriesDenominator = Math.max(matchMeta.targetCaloriesPerServing, 1)
  const proteinsDenominator = Math.max(matchMeta.targetProteinsPerServing, 1)
  const normalizedCaloriesDelta = matchMeta.caloriesDelta / caloriesDenominator
  const normalizedProteinsDelta =
    matchMeta.proteinsDelta === null || matchMeta.proteinsDelta === undefined
      ? 1
      : matchMeta.proteinsDelta / proteinsDenominator
  const penalty = normalizedCaloriesDelta * caloriesWeight + normalizedProteinsDelta * proteinsWeight
  const score = 100 - penalty * 100

  return Math.round(Math.max(0, score) * 100) / 100
}

export function normalizeExplanationItems(
  value: unknown,
  idField: 'recipeId' | 'productId',
): Array<{ id: string; reason: string }> {
  if (!Array.isArray(value)) {
    return []
  }

  const unique = new Map<string, string>()

  for (const item of value) {
    if (!isRecord(item)) {
      continue
    }

    const rawId = item[idField]
    const rawReason = item.reason

    if (typeof rawId !== 'string' || rawId.trim().length === 0) {
      continue
    }

    if (typeof rawReason !== 'string' || rawReason.trim().length === 0) {
      continue
    }

    const id = rawId.trim()

    if (unique.has(id)) {
      continue
    }

    unique.set(id, rawReason.trim())
  }

  return [...unique.entries()].map(([id, reason]) => ({
    id,
    reason,
  }))
}

function getActivityMultiplier(activityLevel: NutritionActivityLevel): number {
  switch (activityLevel) {
    case NutritionActivityLevel.SEDENTARY:
      return 1.2
    case NutritionActivityLevel.LIGHT:
      return 1.375
    case NutritionActivityLevel.MODERATE:
      return 1.55
    case NutritionActivityLevel.ACTIVE:
      return 1.725
    case NutritionActivityLevel.VERY_ACTIVE:
      return 1.9
    default:
      return 1.2
  }
}

function getGoalCaloriesAdjustment(goal: NutritionGoal): number {
  switch (goal) {
    case NutritionGoal.LOSE_WEIGHT:
      return -400
    case NutritionGoal.GAIN_WEIGHT:
      return 300
    case NutritionGoal.MAINTAIN_WEIGHT:
    default:
      return 0
  }
}
