import { ApiPropertyOptional } from '@nestjs/swagger'
import { RecipeDifficultyKey } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { IsEnum, IsInt, IsMax, IsMin } from '@common/validation'

export class RecipeRecommendationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsMin(1)
  @IsMax(30)
  @ApiPropertyOptional({
    description: 'Maximum recommendations to return',
    example: 10,
    minimum: 1,
    maximum: 30,
  })
  public limit?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsMin(1)
  @IsMax(1440)
  @ApiPropertyOptional({
    description: 'Maximum cooking time in minutes',
    example: 45,
    minimum: 1,
    maximum: 1440,
  })
  public maxCookingTimeMinutes?: number

  @IsOptional()
  @IsEnum(RecipeDifficultyKey)
  @ApiPropertyOptional({
    description: 'Filter by recipe difficulty',
    enum: RecipeDifficultyKey,
    example: RecipeDifficultyKey.MEDIUM,
  })
  public difficulty?: RecipeDifficultyKey
}
