import { ApiProperty } from '@nestjs/swagger'
import { ShoppingListStatus } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'
import { ShoppingListListItem } from '../type'

@Exclude()
export class ShoppingListListItemApiModel {
  @Expose()
  @ToId()
  @ApiProperty({ description: 'Shopping list ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public id: Hash

  @Expose()
  @ApiProperty({
    description: 'Shopping list title',
    example: 'Weekly grocery list',
    required: false,
    nullable: true,
  })
  public title?: string | null

  @Expose()
  @ApiProperty({ description: 'Shopping list status', enum: ShoppingListStatus, required: true })
  public status: ShoppingListStatus

  @Expose()
  @ApiProperty({ description: 'Shopping list items count', example: 12, required: true })
  public itemsCount: number

  @Expose()
  @ApiProperty({ description: 'Shopping list created at date', example: new Date(), required: true })
  public createdAt: Date

  @Expose()
  @ApiProperty({ description: 'Shopping list updated at date', example: new Date(), required: true })
  public updatedAt: Date

  public constructor(shoppingList: ShoppingListListItem) {
    Object.assign(this, shoppingList)
  }

  public static from(shoppingList: ShoppingListListItem): ShoppingListListItemApiModel {
    return new this(shoppingList)
  }

  public static fromList(shoppingLists: ShoppingListListItem[]): ShoppingListListItemApiModel[] {
    return shoppingLists.map((shoppingList) => this.from(shoppingList))
  }
}
