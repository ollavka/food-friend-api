import { PartialType } from '@nestjs/swagger'
import { RecipeStatus } from '@prisma/client'
import { IsOptional } from 'class-validator'
import { IsIn } from '@common/validation'
import { CreateRecipeDto } from './create-recipe.dto'

export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {
  @IsOptional()
  @IsIn([RecipeStatus.DRAFT, RecipeStatus.PUBLISHED, RecipeStatus.ARCHIVED])
  public status?: RecipeStatus
}
