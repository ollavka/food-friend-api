import { ApiPropertyOptional } from '@nestjs/swagger'
import { ShoppingListStatus } from '@prisma/client'
import { IsOptional } from 'class-validator'
import { IsEnum } from '@common/validation'

export class ShoppingListFilterQueryDto {
  @ApiPropertyOptional({
    description: 'Shopping list status filter. If undefined is passed, only active shopping lists will be returned.',
    enum: ShoppingListStatus,
    example: ShoppingListStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ShoppingListStatus)
  public status?: ShoppingListStatus
}
