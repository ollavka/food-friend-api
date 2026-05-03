import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { RecipeSubstitutionItem } from '../type'
import { RecipeSubstitutionItemApiModel } from './recipe-substitution-item.api-model'

@Exclude()
export class RecipeSubstitutionsApiModel {
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => RecipeSubstitutionItemApiModel)
  @ApiProperty({ type: () => [RecipeSubstitutionItemApiModel], required: true })
  public items: RecipeSubstitutionItemApiModel[]

  public constructor(items: RecipeSubstitutionItem[]) {
    this.items = RecipeSubstitutionItemApiModel.fromList(items)
  }

  public static from(items: RecipeSubstitutionItem[]): RecipeSubstitutionsApiModel {
    return new this(items)
  }
}
