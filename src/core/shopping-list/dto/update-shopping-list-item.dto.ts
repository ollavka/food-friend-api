import { ApiPropertyOptional } from '@nestjs/swagger'
import { ShoppingListItemStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'
import { IsEnum, IsMin, IsString } from '@common/validation'

export class UpdateShoppingListItemDto {
  @IsOptional()
  @IsEnum(ShoppingListItemStatus)
  @ApiPropertyOptional({
    description: 'Shopping list item status',
    enum: ShoppingListItemStatus,
    example: ShoppingListItemStatus.COMPLETED,
  })
  public status?: ShoppingListItemStatus

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsMin(0)
  @ApiPropertyOptional({
    description: 'Shopping list item quantity',
    example: 2.5,
  })
  public quantity?: number

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Shopping list item note',
    example: 'Prefer organic product',
  })
  public note?: string
}
