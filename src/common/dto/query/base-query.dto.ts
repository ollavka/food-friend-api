import { applyDecorators } from '@nestjs/common'
import { ApiHideProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, ValidateNested } from 'class-validator'
import { BaseQuery } from '@common/type'
import { PaginationQueryDto } from './pagination-query.dto'
import { createSortFieldQueryDto } from './sort-field-query.dto'

type ClassType<T> = new (...args: any[]) => T
type BaseQueryDtoClass<Filter, SortField extends string> = new () => BaseQuery<Filter, SortField>

type CreateBaseQueryDtoParams<Filter, SortField extends string> = {
  filterDto?: ClassType<Filter>
  availableSortFields?: readonly SortField[]
  includePagination?: boolean
}

export function createBaseQueryDto<Filter, SortField extends string>({
  filterDto,
  availableSortFields,
  includePagination,
}: CreateBaseQueryDtoParams<Filter, SortField>): BaseQueryDtoClass<Filter, SortField> {
  const SortFieldQueryDto = createSortFieldQueryDto(availableSortFields ?? [])

  const Filtering = filterDto
    ? applyDecorators(
        ApiHideProperty(),
        IsOptional(),
        ValidateNested(),
        Type(() => filterDto),
      )
    : applyDecorators(ApiHideProperty())

  const Pagination = includePagination
    ? applyDecorators(
        ApiHideProperty(),
        IsOptional(),
        ValidateNested(),
        Type(() => PaginationQueryDto),
      )
    : applyDecorators(ApiHideProperty())

  const Sorting = availableSortFields?.length
    ? applyDecorators(
        ApiHideProperty(),
        IsOptional(),
        ValidateNested(),
        Type(() => SortFieldQueryDto),
      )
    : applyDecorators(ApiHideProperty())

  class BaseQueryDtoImpl implements BaseQuery<Filter, SortField> {
    @Filtering
    public filter?: Filter

    @Sorting
    public sort?: InstanceType<typeof SortFieldQueryDto>

    @Pagination
    public pagination?: PaginationQueryDto

    public constructor() {
      if (includePagination && !this.pagination) {
        this.pagination = new PaginationQueryDto()
      }
    }
  }

  return BaseQueryDtoImpl
}
