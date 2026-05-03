export type RecipeRecommendationMatchMeta = {
  targetCaloriesPerServing: number
  targetProteinsPerServing: number
  caloriesPerServing: number
  proteinsPerServing?: number | null
  caloriesDelta: number
  proteinsDelta?: number | null
}
