import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'
import { PaginationQuery } from '@common/type'

export class PaginationQueryDto implements PaginationQuery {
  @ApiPropertyOptional({ description: 'Page number', default: 1, example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public page = 1

  @ApiPropertyOptional({ description: 'Resources by page limit number', default: 10, example: 10, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public limit = 10
}
