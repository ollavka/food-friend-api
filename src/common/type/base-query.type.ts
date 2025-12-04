import { SortOrder } from '@common/enum'

export interface PaginationQuery {
  page?: number
  limit?: number
}

export interface SortFieldQuery<F = string> {
  order?: SortOrder
  field?: F
}

export interface BaseQuery<Filter = Record<string, unknown>, SortField = string> {
  filter?: Filter
  sort?: SortFieldQuery<SortField>
  pagination?: PaginationQuery
}
