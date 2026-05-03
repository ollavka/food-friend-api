import { createBaseQueryDto } from '@common/dto'
import { RECIPE_AVAILABLE_SORT_FIELDS } from '../constant'
import { RecipeFilterQueryDto } from './recipe-filter-query.dto'

export class RecipeQueryDto extends createBaseQueryDto({
  filterDto: RecipeFilterQueryDto,
  includePagination: true,
  availableSortFields: RECIPE_AVAILABLE_SORT_FIELDS,
}) {}
