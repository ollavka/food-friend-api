import { createBaseQueryDto } from '@common/dto'
import { SHOPPING_LIST_AVAILABLE_SORT_FIELDS } from '../constant'
import { ShoppingListFilterQueryDto } from './shopping-list-filter-query.dto'

export class ShoppingListQueryDto extends createBaseQueryDto({
  filterDto: ShoppingListFilterQueryDto,
  includePagination: true,
  availableSortFields: SHOPPING_LIST_AVAILABLE_SORT_FIELDS,
}) {}
