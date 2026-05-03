import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { IsId, IsInt, IsMax, IsMin } from '@common/validation'

export class RecipeSubstitutionsDto {
  @IsId()
  @ApiProperty({
    description: 'Ingredient product ID from recipe to find substitutions for',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public ingredientProductId: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsMin(1)
  @IsMax(30)
  @ApiPropertyOptional({
    description: 'Maximum substitutions to return',
    example: 10,
    minimum: 1,
    maximum: 30,
  })
  public limit?: number

  @IsOptional()
  @IsId({ each: true })
  @ApiPropertyOptional({
    description: 'Additional product IDs to exclude from substitutions',
    type: [String],
    example: ['LnT8BAUhhoJ2Y6MuB9AAZp'],
  })
  public excludeProductIds?: string[]
}
