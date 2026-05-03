import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsOptional } from 'class-validator'
import { IsId, IsString } from '@common/validation'

export class GenerateShoppingListDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsId({ each: true })
  @ApiProperty({
    description: 'Recipe IDs for shopping list generation',
    type: [String],
    example: ['LnT8BAUhhoJ2Y6MuB9AAZp', '8u3zXpxxAsxR5wA4YJ4CXf'],
    required: true,
  })
  public recipeIds: string[]

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Shopping list title',
    example: 'Weekly grocery list',
  })
  public title?: string
}
