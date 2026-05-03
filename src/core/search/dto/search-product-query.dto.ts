import { createBaseQueryDto } from '@common/dto'
import { SearchProductFilterQueryDto } from './search-product-filter-query.dto'

export class SearchProductQueryDto extends createBaseQueryDto({
  filterDto: SearchProductFilterQueryDto,
  includePagination: true,
}) {}
