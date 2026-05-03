import { ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { RecipeNutrition } from '../type'

@Exclude()
export class RecipeNutritionApiModel {
  @Expose()
  @ApiPropertyOptional({ description: 'Calories (kcal)', example: 420 })
  public kcal?: number | null

  @Expose()
  @ApiPropertyOptional({ description: 'Proteins (g)', example: 18.5 })
  public proteins?: number | null

  @Expose()
  @ApiPropertyOptional({ description: 'Fats (g)', example: 12.3 })
  public fats?: number | null

  @Expose()
  @ApiPropertyOptional({ description: 'Carbs (g)', example: 55.7 })
  public carbs?: number | null

  @Expose()
  @ApiPropertyOptional({ description: 'Fiber (g)', example: 7.2 })
  public fiber?: number | null

  @Expose()
  @ApiPropertyOptional({ description: 'Sugar (g)', example: 4.1 })
  public sugar?: number | null

  @Expose()
  @ApiPropertyOptional({ description: 'Sodium (mg)', example: 560 })
  public sodiumMg?: number | null

  @Expose()
  @ApiPropertyOptional({ description: 'Whether nutrition is estimated', example: false })
  public isEstimated: boolean

  public constructor(nutrition: RecipeNutrition) {
    Object.assign(this, nutrition)
  }

  public static from(nutrition: RecipeNutrition): RecipeNutritionApiModel {
    return new this(nutrition)
  }
}
