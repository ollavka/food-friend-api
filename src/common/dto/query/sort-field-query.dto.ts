import { ApiHideProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { SortOrder } from '@common/enum'
import { SortFieldQuery } from '@common/type'
import { IsEnum, IsIn } from '@common/validation'

type SortFieldQueryDtoClass<F> = new () => SortFieldQuery<F>

export function createSortFieldQueryDto<F extends string>(allowedFields: readonly F[]): SortFieldQueryDtoClass<F> {
  class SortFieldQueryDtoImpl implements SortFieldQuery<F> {
    @ApiHideProperty()
    @IsOptional()
    @IsEnum(SortOrder)
    public order = SortOrder.Ascending

    @ApiHideProperty()
    @IsOptional()
    @IsIn(allowedFields)
    public field?: F
  }

  return SortFieldQueryDtoImpl
}
