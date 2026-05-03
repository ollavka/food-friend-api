import { Uuid } from '@common/type'

export type RecipeAuthor = {
  id: Uuid
  firstName: string | null
  lastName: string | null
}
