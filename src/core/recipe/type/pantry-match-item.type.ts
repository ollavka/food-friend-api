import { RecipeListItem } from './recipe-list-item.type'

export type PantryMissingIngredient = {
  productId: string
  productName: string
  measurementUnitKey: string
  measurementUnitLabel: string
  quantity: number
}

export type PantryMatchItem = {
  recipe: RecipeListItem
  coveragePercent: number
  matchedIngredientsCount: number
  totalIngredientsCount: number
  quantitySufficientCount: number
  missingIngredients: PantryMissingIngredient[]
}
