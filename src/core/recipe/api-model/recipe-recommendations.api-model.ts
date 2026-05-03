import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { RecipeRecommendationItem } from '../type'
import { RecipeRecommendationItemApiModel } from './recipe-recommendation-item.api-model'

@Exclude()
export class RecipeRecommendationsApiModel {
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => RecipeRecommendationItemApiModel)
  @ApiProperty({ type: () => [RecipeRecommendationItemApiModel], required: true })
  public items: RecipeRecommendationItemApiModel[]

  public constructor(items: RecipeRecommendationItem[]) {
    this.items = RecipeRecommendationItemApiModel.fromList(items)
  }

  public static from(items: RecipeRecommendationItem[]): RecipeRecommendationsApiModel {
    return new this(items)
  }
}
