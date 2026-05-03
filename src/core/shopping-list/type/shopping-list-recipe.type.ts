import { RecipeStatus } from '@prisma/client'
import { Uuid } from '@common/type'

export type ShoppingListRecipe = {
  id: Uuid
  slug: string
  title: string
  status: RecipeStatus
}
