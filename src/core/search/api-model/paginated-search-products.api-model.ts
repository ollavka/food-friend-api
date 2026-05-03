import { createPaginatedApiModel } from '@common/api-model'
import { SearchProductItemApiModel } from './search-product-item.api-model'

export class PaginatedSearchProductsApiModel extends createPaginatedApiModel(SearchProductItemApiModel) {}
