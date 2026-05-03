import { ShoppingListStatus } from '@prisma/client'
import { Uuid } from '@common/type'

export type ShoppingListListItem = {
  id: Uuid
  title?: string | null
  status: ShoppingListStatus
  itemsCount: number
  createdAt: Date
  updatedAt: Date
}
