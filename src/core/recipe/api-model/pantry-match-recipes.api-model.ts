import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { PantryMatchItem } from '../type'
import { PantryMatchItemApiModel } from './pantry-match-item.api-model'

@Exclude()
export class PantryMatchRecipesApiModel {
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => PantryMatchItemApiModel)
  @ApiProperty({ type: () => [PantryMatchItemApiModel], required: true })
  public items: PantryMatchItemApiModel[]

  public constructor(items: PantryMatchItem[]) {
    this.items = PantryMatchItemApiModel.fromList(items)
  }

  public static from(items: PantryMatchItem[]): PantryMatchRecipesApiModel {
    return new this(items)
  }
}
