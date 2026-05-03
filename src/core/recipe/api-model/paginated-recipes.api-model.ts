import { createPaginatedApiModel } from '@common/api-model'
import { RecipeListItemApiModel } from './recipe-list-item.api-model'

export class PaginatedRecipesApiModel extends createPaginatedApiModel(RecipeListItemApiModel) {}
