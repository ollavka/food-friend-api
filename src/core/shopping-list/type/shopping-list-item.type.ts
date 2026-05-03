import { MeasurementUnitKey, ShoppingListItemStatus } from '@prisma/client'
import { Uuid } from '@common/type'

export type ShoppingListItem = {
  id: Uuid
  productId: Uuid
  productName: string
  measurementUnitKey: MeasurementUnitKey
  measurementUnitLabel: string
  quantity: number
  note?: string | null
  isManual: boolean
  status: ShoppingListItemStatus
}
