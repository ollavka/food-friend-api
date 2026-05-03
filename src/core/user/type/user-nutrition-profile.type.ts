import { NutritionActivityLevel, NutritionGoal, NutritionSex } from '@prisma/client'
import { Uuid } from '@common/type'

export type UserNutritionProfile = {
  id: Uuid
  userId: Uuid
  sex: NutritionSex
  age: number
  heightCm: number
  weightKg: number
  activityLevel: NutritionActivityLevel
  goal: NutritionGoal
  targetCalories?: number | null
  createdAt: Date
  updatedAt: Date
}
