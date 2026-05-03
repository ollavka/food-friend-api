import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'
import { IsId, IsMin, IsString } from '@common/validation'

export class RecipeIngredientInputDto {
  @IsId()
  @ApiProperty({
    description: 'Product ID',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public productId: string

  @IsId()
  @ApiProperty({
    description: 'Measurement unit ID',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public measurementUnitId: string

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsMin(0)
  @ApiProperty({
    description: 'Ingredient quantity',
    example: 250,
    required: true,
  })
  public quantity: number

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Optional ingredient note',
    example: 'Chopped into cubes',
  })
  public note?: string
}
