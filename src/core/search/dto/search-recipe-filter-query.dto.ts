import { ApiPropertyOptional } from '@nestjs/swagger'
import { RecipeDifficultyKey } from '@prisma/client'
import { IsOptional } from 'class-validator'
import { IsEnum, IsInt, IsMin, IsString } from '@common/validation'

export class SearchRecipeFilterQueryDto {
  @ApiPropertyOptional({
    description: 'Search by recipe localized title, description or slug',
    example: 'mushroom soup',
  })
  @IsOptional()
  @IsString()
  public search?: string

  @ApiPropertyOptional({
    description: 'Filter by recipe difficulty key',
    enum: RecipeDifficultyKey,
    example: RecipeDifficultyKey.EASY,
  })
  @IsOptional()
  @IsEnum(RecipeDifficultyKey)
  public difficulty?: RecipeDifficultyKey

  @ApiPropertyOptional({
    description: 'Maximum cooking time in minutes',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @IsMin(0)
  public maxCookingTimeMinutes?: number
}
