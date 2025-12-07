import { createPaginatedApiModel } from '@common/api-model'
import { ProductApiModel } from './product.api-model'

export class PaginatedProductsApiModel extends createPaginatedApiModel(ProductApiModel) {}
