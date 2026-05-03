import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'
import { PantryMissingIngredient } from '../type'

@Exclude()
export class PantryMissingIngredientApiModel {
  @Expose()
  @ToId()
  @ApiProperty({ description: 'Missing product ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public productId: Hash

  @Expose()
  @ApiProperty({ description: 'Localized missing product name', example: 'Potato', required: true })
  public productName: string

  @Expose()
  @ApiProperty({ description: 'Measurement unit key', example: 'G', required: true })
  public measurementUnitKey: string

  @Expose()
  @ApiProperty({ description: 'Localized measurement unit label', example: 'g', required: true })
  public measurementUnitLabel: string

  @Expose()
  @ApiProperty({ description: 'Required ingredient quantity', example: 300, required: true })
  public quantity: number

  public constructor(data: PantryMissingIngredient) {
    Object.assign(this, data)
  }

  public static from(data: PantryMissingIngredient): PantryMissingIngredientApiModel {
    return new this(data)
  }

  public static fromList(data: PantryMissingIngredient[]): PantryMissingIngredientApiModel[] {
    return data.map((item) => this.from(item))
  }
}
