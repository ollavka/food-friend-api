import { createBaseQueryDto } from '@common/dto'
import { PRODUCT_AVAILABLE_SORT_FIELDS } from '../constant'
import { ProductFilterQueryDto } from './product-filter-query.dto'

export class ProductQueryDto extends createBaseQueryDto({
  filterDto: ProductFilterQueryDto,
  includePagination: true,
  availableSortFields: PRODUCT_AVAILABLE_SORT_FIELDS,
}) {}
