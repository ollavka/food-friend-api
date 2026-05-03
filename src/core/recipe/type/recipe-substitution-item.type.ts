export type RecipeSubstitutionItem = {
  productId: string
  name: string
  measurementUnitKey?: string | null
  measurementUnitLabel?: string | null
  isSystem: boolean
  usageCount: number
  reason?: string | null
}
