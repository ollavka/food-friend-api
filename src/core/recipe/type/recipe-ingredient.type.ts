import { MeasurementUnitKey } from '@prisma/client'
import { Uuid } from '@common/type'

export type RecipeIngredient = {
  productId: Uuid
  productName: string
  measurementUnitKey: MeasurementUnitKey
  measurementUnitLabel: string
  quantity: number
  note?: string | null
}
