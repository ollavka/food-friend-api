import { ApiProperty } from '@nestjs/swagger'
import { MeasurementUnitKey, ShoppingListItemStatus } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'
import { ShoppingListItem } from '../type'

@Exclude()
export class ShoppingListItemApiModel {
  @Expose()
  @ToId()
  @ApiProperty({ description: 'Shopping list item ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public id: Hash

  @Expose()
  @ToId()
  @ApiProperty({ description: 'Product ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public productId: Hash

  @Expose()
  @ApiProperty({ description: 'Localized product name', example: 'Potato', required: true })
  public productName: string

  @Expose()
  @ApiProperty({ description: 'Measurement unit key', enum: MeasurementUnitKey, example: MeasurementUnitKey.KG })
  public measurementUnitKey: MeasurementUnitKey

  @Expose()
  @ApiProperty({ description: 'Localized measurement unit label', example: 'kg', required: true })
  public measurementUnitLabel: string

  @Expose()
  @ApiProperty({ description: 'Shopping list item quantity', example: 2.5, required: true })
  public quantity: number

  @Expose()
  @ApiProperty({
    description: 'Shopping list item note',
    example: 'Prefer organic product',
    required: false,
    nullable: true,
  })
  public note?: string | null

  @Expose()
  @ApiProperty({ description: 'Is item manually changed', example: false, required: true })
  public isManual: boolean

  @Expose()
  @ApiProperty({ description: 'Shopping list item status', enum: ShoppingListItemStatus, required: true })
  public status: ShoppingListItemStatus

  public constructor(item: ShoppingListItem) {
    Object.assign(this, item)
  }

  public static from(item: ShoppingListItem): ShoppingListItemApiModel {
    return new this(item)
  }

  public static fromList(items: ShoppingListItem[]): ShoppingListItemApiModel[] {
    return items.map((item) => this.from(item))
  }
}
