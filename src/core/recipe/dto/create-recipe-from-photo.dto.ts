import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { IsString } from '@common/validation'

export class CreateRecipeFromPhotoDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Recipe source photo file',
  })
  public photo?: unknown

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'External image URL. If passed, image will be mirrored to S3 before processing.',
    example: 'https://images.example.com/meal.jpg',
  })
  public imageUrl?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Optional prompt with additional context for recipe generation.',
    example: 'Домашня українська страва з акцентом на прості кроки приготування.',
  })
  public prompt?: string
}
