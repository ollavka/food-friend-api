import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { PantryMatchItem } from '../type'
import { PantryMissingIngredientApiModel } from './pantry-missing-ingredient.api-model'
import { RecipeListItemApiModel } from './recipe-list-item.api-model'

@Exclude()
export class PantryMatchItemApiModel {
  @Expose()
  @ValidateNested()
  @Type(() => RecipeListItemApiModel)
  @ApiProperty({ type: () => RecipeListItemApiModel, required: true })
  public recipe: RecipeListItemApiModel

  @Expose()
  @ApiProperty({ description: 'Recipe ingredient coverage percent by pantry products', example: 66.67, required: true })
  public coveragePercent: number

  @Expose()
  @ApiProperty({ description: 'Matched ingredients count', example: 4, required: true })
  public matchedIngredientsCount: number

  @Expose()
  @ApiProperty({ description: 'Total ingredients count', example: 6, required: true })
  public totalIngredientsCount: number

  @Expose()
  @ApiProperty({ description: 'Matched ingredients with sufficient quantity', example: 2, required: true })
  public quantitySufficientCount: number

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => PantryMissingIngredientApiModel)
  @ApiProperty({ type: () => [PantryMissingIngredientApiModel], required: true })
  public missingIngredients: PantryMissingIngredientApiModel[]

  public constructor(data: PantryMatchItem) {
    this.recipe = RecipeListItemApiModel.from(data.recipe)
    this.coveragePercent = data.coveragePercent
    this.matchedIngredientsCount = data.matchedIngredientsCount
    this.totalIngredientsCount = data.totalIngredientsCount
    this.quantitySufficientCount = data.quantitySufficientCount
    this.missingIngredients = PantryMissingIngredientApiModel.fromList(data.missingIngredients)
  }

  public static from(data: PantryMatchItem): PantryMatchItemApiModel {
    return new this(data)
  }

  public static fromList(data: PantryMatchItem[]): PantryMatchItemApiModel[] {
    return data.map((item) => this.from(item))
  }
}
