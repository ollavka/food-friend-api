import { ApiPropertyOptional } from '@nestjs/swagger'
import { RecipeDifficultyKey, RecipeStatus } from '@prisma/client'
import { IsOptional } from 'class-validator'
import { IsEnum, IsIn, IsString } from '@common/validation'

export class RecipeFilterQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive search by recipe title, description or slug',
    example: 'mushroom pasta',
  })
  @IsOptional()
  @IsString()
  public search?: string

  @ApiPropertyOptional({
    description: 'Recipe difficulty level key',
    enum: RecipeDifficultyKey,
    example: RecipeDifficultyKey.EASY,
  })
  @IsOptional()
  @IsEnum(RecipeDifficultyKey)
  public difficulty?: RecipeDifficultyKey

  @ApiPropertyOptional({
    description: 'Recipe status for this endpoint. Only published recipes are available in public listing.',
    enum: [RecipeStatus.PUBLISHED],
    example: RecipeStatus.PUBLISHED,
  })
  @IsOptional()
  @IsIn([RecipeStatus.PUBLISHED])
  public status?: RecipeStatus
}
