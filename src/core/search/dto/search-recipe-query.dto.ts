import { createBaseQueryDto } from '@common/dto'
import { SearchRecipeFilterQueryDto } from './search-recipe-filter-query.dto'

export class SearchRecipeQueryDto extends createBaseQueryDto({
  filterDto: SearchRecipeFilterQueryDto,
  includePagination: true,
}) {}
