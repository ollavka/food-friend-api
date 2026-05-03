import { RecipeListItem } from './recipe-list-item.type'
import { RecipeRecommendationMatchMeta } from './recipe-recommendation-match-meta.type'

export type RecipeRecommendationItem = {
  recipe: RecipeListItem
  score: number
  matchMeta: RecipeRecommendationMatchMeta
  reason?: string | null
}
