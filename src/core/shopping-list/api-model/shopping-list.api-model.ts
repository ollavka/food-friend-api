import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { ShoppingListDetails } from '../type'
import { ShoppingListItemApiModel } from './shopping-list-item.api-model'
import { ShoppingListListItemApiModel } from './shopping-list-list-item.api-model'
import { ShoppingListRecipeApiModel } from './shopping-list-recipe.api-model'

export class ShoppingListApiModel extends ShoppingListListItemApiModel {
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ShoppingListRecipeApiModel)
  @ApiProperty({ type: () => [ShoppingListRecipeApiModel], required: true })
  public recipes: ShoppingListRecipeApiModel[]

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ShoppingListItemApiModel)
  @ApiProperty({ type: () => [ShoppingListItemApiModel], required: true })
  public items: ShoppingListItemApiModel[]

  public constructor(shoppingList: ShoppingListDetails) {
    const { recipes, items, ...shoppingListData } = shoppingList
    super(shoppingListData)
    this.recipes = ShoppingListRecipeApiModel.fromList(recipes)
    this.items = ShoppingListItemApiModel.fromList(items)
  }

  public static from(shoppingList: ShoppingListDetails): ShoppingListApiModel {
    return new this(shoppingList)
  }
}
