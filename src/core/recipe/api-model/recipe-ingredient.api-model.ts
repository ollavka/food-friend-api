import { ApiProperty } from '@nestjs/swagger'
import { MeasurementUnitKey } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'
import { RecipeIngredient } from '../type'

@Exclude()
export class RecipeIngredientApiModel {
  @Expose()
  @ToId()
  @ApiProperty({ description: 'Ingredient product ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public productId: Hash

  @Expose()
  @ApiProperty({ description: 'Ingredient product name', example: 'Mushrooms', required: true })
  public productName: string

  @Expose()
  @ApiProperty({ description: 'Ingredient measurement unit key', enum: MeasurementUnitKey, required: true })
  public measurementUnitKey: MeasurementUnitKey

  @Expose()
  @ApiProperty({ description: 'Ingredient measurement unit label', example: 'g', required: true })
  public measurementUnitLabel: string

  @Expose()
  @ApiProperty({ description: 'Ingredient quantity', example: 250, required: true })
  public quantity: number

  @Expose()
  @ApiProperty({ description: 'Ingredient note', example: 'Chopped into cubes', required: false, nullable: true })
  public note?: string | null

  public constructor(ingredient: RecipeIngredient) {
    Object.assign(this, ingredient)
  }

  public static from(ingredient: RecipeIngredient): RecipeIngredientApiModel {
    return new this(ingredient)
  }

  public static fromList(ingredients: RecipeIngredient[]): RecipeIngredientApiModel[] {
    return ingredients.map((ingredient) => this.from(ingredient))
  }
}
