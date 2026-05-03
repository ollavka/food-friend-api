import { RecipeStatus } from '@prisma/client'
import { Uuid } from '@common/type'
import { RecipeAuthor } from './recipe-author.type'

export type RecipeListItem = {
  id: Uuid
  slug: string
  status: RecipeStatus
  title: string
  description?: string | null
  cookingTimeMinutes: number
  servings?: number | null
  imageUrl?: string | null
  likesCount: number
  favoritesCount: number
  viewsCount: number
  isLiked?: boolean | null
  isFavorite?: boolean | null
  difficultyKey: string
  difficultyLabel: string
  author: RecipeAuthor
  createdAt: Date
  updatedAt: Date
}
