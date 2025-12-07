import { ApiHideProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { PaginationQuery } from '@common/type'
import { IsInt, IsMax, IsMin } from '@common/validation'

export class PaginationQueryDto implements PaginationQuery {
  @ApiHideProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsMin(1)
  public page = 1

  @ApiHideProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsMin(1)
  @IsMax(100)
  public limit = 10
}
