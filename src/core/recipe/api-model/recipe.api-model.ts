import { ApiProperty } from '@nestjs/swagger'
import { LanguageCode } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { RecipeDetails } from '../type'
import { RecipeIngredientApiModel } from './recipe-ingredient.api-model'
import { RecipeListItemApiModel } from './recipe-list-item.api-model'
import { RecipeNutritionApiModel } from './recipe-nutrition.api-model'
import { RecipeStepApiModel } from './recipe-step.api-model'

export class RecipeApiModel extends RecipeListItemApiModel {
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => RecipeStepApiModel)
  @ApiProperty({ type: () => [RecipeStepApiModel], required: true })
  public steps: RecipeStepApiModel[]

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientApiModel)
  @ApiProperty({ type: () => [RecipeIngredientApiModel], required: true })
  public ingredients: RecipeIngredientApiModel[]

  @Expose()
  @ValidateNested()
  @Type(() => RecipeNutritionApiModel)
  @ApiProperty({ type: () => RecipeNutritionApiModel, required: false, nullable: true })
  public nutrition?: RecipeNutritionApiModel | null

  @Expose()
  @ApiProperty({ description: 'Source language code', enum: LanguageCode, required: false, nullable: true })
  public sourceLanguageCode?: LanguageCode | null

  public constructor(recipe: RecipeDetails) {
    const { steps, ingredients, nutrition, ...recipeData } = recipe
    super(recipeData)
    this.steps = RecipeStepApiModel.fromList(steps)
    this.ingredients = RecipeIngredientApiModel.fromList(ingredients)
    this.nutrition = nutrition ? RecipeNutritionApiModel.from(nutrition) : null
    this.sourceLanguageCode = recipe.sourceLanguageCode ?? null
  }

  public static from(recipe: RecipeDetails): RecipeApiModel {
    return new this(recipe)
  }
}
