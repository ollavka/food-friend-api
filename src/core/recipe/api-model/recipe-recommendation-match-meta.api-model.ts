import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { RecipeRecommendationMatchMeta } from '../type'

@Exclude()
export class RecipeRecommendationMatchMetaApiModel {
  @Expose()
  @ApiProperty({ description: 'Target calories per serving', example: 650, required: true })
  public targetCaloriesPerServing: number

  @Expose()
  @ApiProperty({ description: 'Target proteins per serving', example: 40, required: true })
  public targetProteinsPerServing: number

  @Expose()
  @ApiProperty({ description: 'Recipe calories per serving', example: 620, required: true })
  public caloriesPerServing: number

  @Expose()
  @ApiProperty({
    description: 'Recipe proteins per serving',
    example: 37.5,
    required: false,
    nullable: true,
  })
  public proteinsPerServing?: number | null

  @Expose()
  @ApiProperty({ description: 'Absolute calories delta to target', example: 30, required: true })
  public caloriesDelta: number

  @Expose()
  @ApiProperty({
    description: 'Absolute proteins delta to target',
    example: 2.5,
    required: false,
    nullable: true,
  })
  public proteinsDelta?: number | null

  public constructor(data: RecipeRecommendationMatchMeta) {
    Object.assign(this, data)
  }

  public static from(data: RecipeRecommendationMatchMeta): RecipeRecommendationMatchMetaApiModel {
    return new this(data)
  }
}
