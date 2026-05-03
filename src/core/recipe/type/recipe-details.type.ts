import { LanguageCode } from '@prisma/client'
import { RecipeIngredient } from './recipe-ingredient.type'
import { RecipeListItem } from './recipe-list-item.type'
import { RecipeNutrition } from './recipe-nutrition.type'
import { RecipeStep } from './recipe-step.type'

export type RecipeDetails = RecipeListItem & {
  sourceLanguageCode?: LanguageCode | null
  steps: RecipeStep[]
  ingredients: RecipeIngredient[]
  nutrition?: RecipeNutrition | null
}
