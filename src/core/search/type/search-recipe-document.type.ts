import { RecipeDifficultyKey, RecipeStatus } from '@prisma/client'
import { Uuid } from '@common/type'

export type SearchRecipeDocument = {
  id: Uuid
  slug: string
  status: RecipeStatus
  authorId: Uuid
  authorFirstName: string | null
  authorLastName: string | null
  imageUrl: string | null
  difficultyKey: RecipeDifficultyKey
  difficultyLabelsByLanguage: Record<string, string>
  cookingTimeMinutes: number
  servings: number | null
  publishedAtTs: number | null
  titlesByLanguage: Record<string, string>
  descriptionsByLanguage: Record<string, string>
  searchTitles: string[]
  searchDescriptions: string[]
  createdAtTs: number
  updatedAtTs: number
}
