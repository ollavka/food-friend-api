import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { SortOrder } from '@common/enum'
import { SortFieldQuery } from '@common/type'
import { IsEnum, IsIn } from '@common/validation'

type SortFieldQueryDtoClass<F> = new () => SortFieldQuery<F>

export function createSortFieldQueryDto<F extends string>(allowedFields: readonly F[]): SortFieldQueryDtoClass<F> {
  class SortFieldQueryDtoImpl implements SortFieldQuery<F> {
    @ApiPropertyOptional({
      description: 'Sort direction',
      enum: SortOrder,
      example: SortOrder.Ascending,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    public order = SortOrder.Ascending

    @ApiPropertyOptional({
      description: 'Field name to sort by',
      enum: allowedFields,
      examples: allowedFields,
    })
    @IsOptional()
    @IsIn(allowedFields)
    public field?: F
  }

  return SortFieldQueryDtoImpl
}
