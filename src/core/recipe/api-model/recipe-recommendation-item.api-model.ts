import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { RecipeRecommendationItem } from '../type'
import { RecipeListItemApiModel } from './recipe-list-item.api-model'
import { RecipeRecommendationMatchMetaApiModel } from './recipe-recommendation-match-meta.api-model'

@Exclude()
export class RecipeRecommendationItemApiModel {
  @Expose()
  @ValidateNested()
  @Type(() => RecipeListItemApiModel)
  @ApiProperty({ type: () => RecipeListItemApiModel, required: true })
  public recipe: RecipeListItemApiModel

  @Expose()
  @ApiProperty({ description: 'Recommendation score', example: 87.52, required: true })
  public score: number

  @Expose()
  @ValidateNested()
  @Type(() => RecipeRecommendationMatchMetaApiModel)
  @ApiProperty({ type: () => RecipeRecommendationMatchMetaApiModel, required: true })
  public matchMeta: RecipeRecommendationMatchMetaApiModel

  @Expose()
  @ApiProperty({
    description: 'Optional AI explanation why recipe matches user goal',
    example: 'Balanced calories and strong protein per serving for your current goal.',
    required: false,
    nullable: true,
  })
  public reason?: string | null

  public constructor(data: RecipeRecommendationItem) {
    this.recipe = RecipeListItemApiModel.from(data.recipe)
    this.score = data.score
    this.matchMeta = RecipeRecommendationMatchMetaApiModel.from(data.matchMeta)
    this.reason = data.reason ?? null
  }

  public static from(data: RecipeRecommendationItem): RecipeRecommendationItemApiModel {
    return new this(data)
  }

  public static fromList(data: RecipeRecommendationItem[]): RecipeRecommendationItemApiModel[] {
    return data.map((item) => this.from(item))
  }
}
