import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RecipeDifficultyKey, RecipeStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsOptional, ValidateNested } from 'class-validator'
import { IsEnum, IsIn, IsInt, IsMin, IsNotEmpty, IsString } from '@common/validation'
import { RecipeIngredientInputDto } from './recipe-ingredient-input.dto'
import { RecipeNutritionInputDto } from './recipe-nutrition-input.dto'
import { RecipeStepInputDto } from './recipe-step-input.dto'

export class CreateRecipeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Recipe title', example: 'Creamy mushroom pasta', required: true })
  public title: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Recipe description',
    example: 'Easy pasta with creamy sauce and mushrooms.',
  })
  public description?: string

  @IsInt()
  @IsMin(0)
  @ApiProperty({ description: 'Cooking time in minutes', example: 25, required: true })
  public cookingTimeMinutes: number

  @IsOptional()
  @IsInt()
  @IsMin(1)
  @ApiPropertyOptional({ description: 'Servings count', example: 2 })
  public servings?: number

  @IsEnum(RecipeDifficultyKey)
  @ApiProperty({ description: 'Recipe difficulty key', enum: RecipeDifficultyKey, example: RecipeDifficultyKey.EASY })
  public difficulty: RecipeDifficultyKey

  @IsOptional()
  @IsIn([RecipeStatus.DRAFT, RecipeStatus.PUBLISHED])
  @ApiPropertyOptional({
    description: 'Recipe status',
    enum: [RecipeStatus.DRAFT, RecipeStatus.PUBLISHED],
    example: RecipeStatus.DRAFT,
  })
  public status?: RecipeStatus

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Recipe image URL',
    example: 'https://bucket.s3.eu-north-1.amazonaws.com/r/1.jpg',
  })
  public imageUrl?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Recipe image key in S3', example: 'recipes/abc123-image.jpg' })
  public imageKey?: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeStepInputDto)
  @ApiProperty({ type: () => [RecipeStepInputDto], required: true })
  public steps: RecipeStepInputDto[]

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientInputDto)
  @ApiProperty({ type: () => [RecipeIngredientInputDto], required: true })
  public ingredients: RecipeIngredientInputDto[]

  @IsOptional()
  @ValidateNested()
  @Type(() => RecipeNutritionInputDto)
  @ApiPropertyOptional({ type: () => RecipeNutritionInputDto })
  public nutrition?: RecipeNutritionInputDto
}
