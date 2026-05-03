import { basename } from 'node:path'
import { LanguageCode, MeasurementUnitKey, RecipeDifficultyKey } from '@prisma/client'
import {
  NormalizeErrorFactory,
  getLanguageLabelByCode,
  normalizeEnumValue,
  normalizeNullableInteger,
  normalizeNullableNumber,
  normalizeNumber,
  normalizeOptionalString,
  normalizeRequiredString,
  normalizeStringArray,
  slugifyText,
  toLowerCase,
} from '@common/util'

export type RecipeFromPhotoIngredientNormalized = {
  name: string
  quantity: number
  measurementUnitKey: MeasurementUnitKey
  note?: string | null
}

export type RecipeFromPhotoNutritionNormalized = {
  kcal?: number | null
  proteins?: number | null
  fats?: number | null
  carbs?: number | null
  fiber?: number | null
  sugar?: number | null
  sodiumMg?: number | null
}

export type RecipeFromPhotoNormalized = {
  title: string
  description?: string | null
  difficulty: RecipeDifficultyKey
  cookingTimeMinutes: number
  servings?: number | null
  steps: string[]
  ingredients: RecipeFromPhotoIngredientNormalized[]
  nutrition?: RecipeFromPhotoNutritionNormalized | null
}

export function buildRecipeImagePrompt(input: {
  title: string
  description?: string | null
  steps: string[]
  languageCode: LanguageCode
  prompt?: string | null
}): string {
  const stepsText = input.steps
    .slice(0, 8)
    .map((step, index) => `${index + 1}. ${step}`)
    .join('\n')

  return [
    `Language: ${getLanguageLabelByCode(input.languageCode)}.`,
    'Generate one realistic food photo for this recipe.',
    'Style: natural, high-detail, appetizing, no text, no watermark, no logos.',
    `Title: ${input.title}`,
    `Description: ${input.description ?? ''}`,
    `Steps:\n${stepsText}`,
    `Additional request: ${input.prompt ?? 'Use neutral composition and natural lighting.'}`,
  ].join('\n\n')
}

export function normalizeRecipeFromPhotoOutput(
  value: Record<string, unknown>,
  errorFactory?: NormalizeErrorFactory,
): RecipeFromPhotoNormalized {
  const title = normalizeRequiredString(value.title, 'title', errorFactory)
  const description = normalizeOptionalString(value.description)
  const difficulty = normalizeEnumValue(value.difficulty, RecipeDifficultyKey, RecipeDifficultyKey.MEDIUM)
  const cookingTimeMinutes = normalizeNumber(value.cookingTimeMinutes, 30, { min: 0, max: 3_600 })
  const servings = normalizeNullableInteger(value.servings, { min: 1, max: 100 })
  const steps = normalizeStringArray(value.steps, 'steps', errorFactory)
  const ingredients = normalizeRecipeFromPhotoIngredients(value.ingredients, errorFactory)
  const nutrition = normalizeRecipeFromPhotoNutrition(value.nutrition)

  return {
    title,
    description,
    difficulty,
    cookingTimeMinutes,
    servings,
    steps,
    ingredients,
    nutrition,
  }
}

export function getImageExtensionByContentType(contentType: string): string {
  switch (contentType) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'image/heic':
    case 'image/heif':
      return 'heic'
    default:
      return 'jpg'
  }
}

export function extractRecipeFileNameFromUrl(url: URL, contentType: string, fallbackFileName: string): string {
  const fileNameFromPath = basename(url.pathname)

  if (fileNameFromPath && fileNameFromPath.includes('.')) {
    return fileNameFromPath
  }

  const ext = getImageExtensionByContentType(contentType)
  return `${fallbackFileName}.${ext}`
}

export function normalizeIngredientName(name: string): string {
  return name.trim()
}

export function ingredientMatchKey(name: string): string {
  return toLowerCase(name.trim()) as string
}

export function slugifyForMatching(value: string): string {
  return slugifyText(value)
}

export function normalizeIngredientQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 1
  }

  return quantity
}

function normalizeRecipeFromPhotoIngredients(
  value: unknown,
  errorFactory?: NormalizeErrorFactory,
): RecipeFromPhotoIngredientNormalized[] {
  if (!Array.isArray(value)) {
    throwNormalizeError('AI output field "ingredients" must be array.', errorFactory)
  }

  const ingredients: RecipeFromPhotoIngredientNormalized[] = []

  for (const item of value) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      continue
    }

    const name = normalizeRequiredString(item.name, 'ingredients.name', errorFactory)
    const quantity = normalizeNumber(item.quantity, 1, { min: 0.001, max: 100_000 })
    const measurementUnitKey = normalizeEnumValue(item.measurementUnitKey, MeasurementUnitKey, MeasurementUnitKey.PC)
    const note = normalizeOptionalString(item.note)

    ingredients.push({
      name,
      quantity,
      measurementUnitKey,
      ...(note !== null ? { note } : {}),
    })
  }

  if (ingredients.length === 0) {
    throwNormalizeError('AI output field "ingredients" must contain values.', errorFactory)
  }

  return ingredients
}

function normalizeRecipeFromPhotoNutrition(value: unknown): RecipeFromPhotoNutritionNormalized | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }

  const nutrition = <Record<string, unknown>>value

  return {
    kcal: normalizeNullableNumber(nutrition.kcal),
    proteins: normalizeNullableNumber(nutrition.proteins),
    fats: normalizeNullableNumber(nutrition.fats),
    carbs: normalizeNullableNumber(nutrition.carbs),
    fiber: normalizeNullableNumber(nutrition.fiber),
    sugar: normalizeNullableNumber(nutrition.sugar),
    sodiumMg: normalizeNullableNumber(nutrition.sodiumMg),
  }
}

function throwNormalizeError(message: string, errorFactory?: NormalizeErrorFactory): never {
  if (errorFactory) {
    throw errorFactory(message)
  }

  throw new Error(message)
}
