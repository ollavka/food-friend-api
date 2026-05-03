import { createPaginatedApiModel } from '@common/api-model'
import { SearchRecipeItemApiModel } from './search-recipe-item.api-model'

export class PaginatedSearchRecipesApiModel extends createPaginatedApiModel(SearchRecipeItemApiModel) {}
