import { ApiProperty } from '@nestjs/swagger'
import { RecipeDifficultyKey, RecipeStatus } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'
import { SearchRecipeAuthorApiModel } from './search-recipe-author.api-model'

type SearchRecipeItem = {
  id: string
  slug: string
  status: RecipeStatus
  title: string
  description?: string | null
  imageUrl?: string | null
  difficultyKey: RecipeDifficultyKey
  difficultyLabel: string
  cookingTimeMinutes: number
  servings?: number | null
  publishedAt?: Date | null
  author: {
    id: string
    firstName: string | null
    lastName: string | null
  }
}

@Exclude()
export class SearchRecipeItemApiModel {
  @Expose()
  @ToId()
  @ApiProperty({ description: 'Recipe ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public id: Hash

  @Expose()
  @ApiProperty({ description: 'Recipe slug', example: 'creamy-mushroom-pasta', required: true })
  public slug: string

  @Expose()
  @ApiProperty({ description: 'Recipe status', enum: RecipeStatus, required: true })
  public status: RecipeStatus

  @Expose()
  @ApiProperty({ description: 'Localized recipe title', example: 'Creamy mushroom pasta', required: true })
  public title: string

  @Expose()
  @ApiProperty({
    description: 'Localized recipe description',
    example: 'Easy pasta with creamy sauce and mushrooms.',
    required: false,
    nullable: true,
  })
  public description?: string | null

  @Expose()
  @ApiProperty({
    description: 'Recipe image URL',
    example: 'https://bucket.s3.eu-north-1.amazonaws.com/recipes/1.jpg',
    required: false,
    nullable: true,
  })
  public imageUrl?: string | null

  @Expose()
  @ApiProperty({ description: 'Recipe difficulty key', enum: RecipeDifficultyKey, required: true })
  public difficultyKey: RecipeDifficultyKey

  @Expose()
  @ApiProperty({ description: 'Localized recipe difficulty label', example: 'Easy', required: true })
  public difficultyLabel: string

  @Expose()
  @ApiProperty({ description: 'Cooking time in minutes', example: 25, required: true })
  public cookingTimeMinutes: number

  @Expose()
  @ApiProperty({ description: 'Servings count', example: 2, required: false, nullable: true })
  public servings?: number | null

  @Expose()
  @ApiProperty({ description: 'Recipe published at date', example: new Date(), required: false, nullable: true })
  public publishedAt?: Date | null

  @Expose()
  @ValidateNested()
  @Type(() => SearchRecipeAuthorApiModel)
  @ApiProperty({
    description: 'Recipe author',
    type: () => SearchRecipeAuthorApiModel,
    required: true,
  })
  public author: SearchRecipeAuthorApiModel

  public constructor(item: SearchRecipeItem) {
    const { author, ...itemData } = item

    Object.assign(this, itemData)
    this.author = SearchRecipeAuthorApiModel.from(author)
  }

  public static from(item: SearchRecipeItem): SearchRecipeItemApiModel {
    return new this(item)
  }

  public static fromList(items: SearchRecipeItem[]): SearchRecipeItemApiModel[] {
    return items.map((item) => this.from(item))
  }
}
