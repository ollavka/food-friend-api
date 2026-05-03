import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMinSize, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import { IsId, IsInt, IsMax, IsMin } from '@common/validation'

export class PantryMatchItemDto {
  @IsId()
  @ApiProperty({
    description: 'Product ID available in pantry',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public productId: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsMin(0)
  @ApiPropertyOptional({
    description: 'Available quantity for this product in pantry',
    example: 2.5,
  })
  public quantity?: number

  @IsOptional()
  @IsId()
  @ApiPropertyOptional({
    description: 'Measurement unit ID for provided quantity',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
  })
  public measurementUnitId?: string
}

export class PantryMatchDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PantryMatchItemDto)
  @ApiProperty({
    description: 'Pantry products to match against recipes',
    type: () => [PantryMatchItemDto],
    required: true,
  })
  public items: PantryMatchItemDto[]

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsMin(1)
  @IsMax(30)
  @ApiPropertyOptional({
    description: 'Maximum recipes to return',
    example: 10,
    minimum: 1,
    maximum: 30,
  })
  public limit?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsMin(0)
  @IsMax(100)
  @ApiPropertyOptional({
    description: 'Minimum coverage percentage for matched recipes',
    example: 40,
    minimum: 0,
    maximum: 100,
  })
  public minCoveragePercent?: number
}
