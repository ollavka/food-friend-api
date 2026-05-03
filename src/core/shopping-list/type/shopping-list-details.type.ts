import { ShoppingListItem } from './shopping-list-item.type'
import { ShoppingListListItem } from './shopping-list-list-item.type'
import { ShoppingListRecipe } from './shopping-list-recipe.type'

export type ShoppingListDetails = ShoppingListListItem & {
  recipes: ShoppingListRecipe[]
  items: ShoppingListItem[]
}
