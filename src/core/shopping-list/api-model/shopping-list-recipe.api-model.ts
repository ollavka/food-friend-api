import { ApiProperty } from '@nestjs/swagger'
import { RecipeStatus } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'
import { ShoppingListRecipe } from '../type'

@Exclude()
export class ShoppingListRecipeApiModel {
  @Expose()
  @ToId()
  @ApiProperty({ description: 'Recipe ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public id: Hash

  @Expose()
  @ApiProperty({ description: 'Recipe slug', example: 'creamy-mushroom-pasta', required: true })
  public slug: string

  @Expose()
  @ApiProperty({ description: 'Localized recipe title', example: 'Creamy mushroom pasta', required: true })
  public title: string

  @Expose()
  @ApiProperty({ description: 'Recipe status', enum: RecipeStatus, required: true })
  public status: RecipeStatus

  public constructor(recipe: ShoppingListRecipe) {
    Object.assign(this, recipe)
  }

  public static from(recipe: ShoppingListRecipe): ShoppingListRecipeApiModel {
    return new this(recipe)
  }

  public static fromList(recipes: ShoppingListRecipe[]): ShoppingListRecipeApiModel[] {
    return recipes.map((recipe) => this.from(recipe))
  }
}
