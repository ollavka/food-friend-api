import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { IsId, IsString } from '@common/validation'

export class CreateRecipeImageDto {
  @IsId()
  @ApiProperty({
    description: 'Recipe ID for image generation',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public recipeId: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Optional prompt that refines generated recipe image style.',
    example: 'Natural daylight, realistic plating, top-down composition.',
  })
  public prompt?: string
}
