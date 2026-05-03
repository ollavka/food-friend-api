import { ApiProperty } from '@nestjs/swagger'
import { RecipeStatus } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'
import { RecipeListItem } from '../type'
import { RecipeAuthorApiModel } from './recipe-author.api-model'

@Exclude()
export class RecipeListItemApiModel {
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
  @ApiProperty({ description: 'Cooking time in minutes', example: 25, required: true })
  public cookingTimeMinutes: number

  @Expose()
  @ApiProperty({ description: 'Servings count', example: 2, required: false, nullable: true })
  public servings?: number | null

  @Expose()
  @ApiProperty({
    description: 'Recipe image URL',
    example: 'https://bucket.s3.eu-north-1.amazonaws.com/r/1.jpg',
    required: false,
    nullable: true,
  })
  public imageUrl?: string | null

  @Expose()
  @ApiProperty({ description: 'Recipe likes count', example: 10, required: true })
  public likesCount: number

  @Expose()
  @ApiProperty({ description: 'Recipe favorites count', example: 7, required: true })
  public favoritesCount: number

  @Expose()
  @ApiProperty({ description: 'Recipe views count', example: 125, required: true })
  public viewsCount: number

  @Expose()
  @ApiProperty({
    description: 'Whether current user liked this recipe',
    example: true,
    required: false,
    nullable: true,
  })
  public isLiked?: boolean | null

  @Expose()
  @ApiProperty({
    description: 'Whether current user added this recipe to favorites',
    example: true,
    required: false,
    nullable: true,
  })
  public isFavorite?: boolean | null

  @Expose()
  @ApiProperty({ description: 'Recipe difficulty key', example: 'EASY', required: true })
  public difficultyKey: string

  @Expose()
  @ApiProperty({ description: 'Localized recipe difficulty label', example: 'Easy', required: true })
  public difficultyLabel: string

  @Expose()
  @ApiProperty({ description: 'Recipe creation date', example: new Date(), required: true })
  public createdAt: Date

  @Expose()
  @ApiProperty({ description: 'Recipe update date', example: new Date(), required: true })
  public updatedAt: Date

  @Expose()
  @ValidateNested()
  @Type(() => RecipeAuthorApiModel)
  @ApiProperty({ type: () => RecipeAuthorApiModel, required: true })
  public author: RecipeAuthorApiModel

  public constructor(recipe: RecipeListItem) {
    const { author, ...recipeData } = recipe
    Object.assign(this, recipeData)
    this.author = RecipeAuthorApiModel.from(author)
  }

  public static from(recipe: RecipeListItem): RecipeListItemApiModel {
    return new this(recipe)
  }

  public static fromList(recipes: RecipeListItem[]): RecipeListItemApiModel[] {
    return recipes.map((recipe) => this.from(recipe))
  }
}
