import { Type } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { PaginatedResult } from '@common/type'
import { PaginationMetaApiModel } from './pagination-meta.api-model'

export const createPaginatedApiModel = <TModel extends Type<unknown>>(
  Model: TModel,
): Type<PaginatedResult<InstanceType<TModel>>> => {
  class PaginatedModel implements PaginatedResult<InstanceType<TModel>> {
    @ApiProperty({ type: () => PaginationMetaApiModel, required: true })
    public meta: PaginationMetaApiModel

    @ApiProperty({ type: () => [Model], required: true })
    public items: InstanceType<TModel>[]
  }

  return PaginatedModel
}
