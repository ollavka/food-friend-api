import { createPaginatedApiModel } from '@common/api-model'
import { ShoppingListListItemApiModel } from './shopping-list-list-item.api-model'

export class PaginatedShoppingListsApiModel extends createPaginatedApiModel(ShoppingListListItemApiModel) {}
