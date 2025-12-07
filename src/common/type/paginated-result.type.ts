import { PaginationMetaApiModel } from '@common/api-model'

export interface PaginatedResult<T> {
  meta: PaginationMetaApiModel
  items: T[]
}
