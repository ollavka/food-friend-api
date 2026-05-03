import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'
import { RecipeSubstitutionItem } from '../type'

@Exclude()
export class RecipeSubstitutionItemApiModel {
  @Expose()
  @ToId()
  @ApiProperty({ description: 'Substitute product ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public productId: Hash

  @Expose()
  @ApiProperty({ description: 'Localized substitute product name', example: 'Sweet potato', required: true })
  public name: string

  @Expose()
  @ApiProperty({
    description: 'Default measurement unit key',
    example: 'G',
    required: false,
    nullable: true,
  })
  public measurementUnitKey?: string | null

  @Expose()
  @ApiProperty({
    description: 'Localized default measurement unit label',
    example: 'g',
    required: false,
    nullable: true,
  })
  public measurementUnitLabel?: string | null

  @Expose()
  @ApiProperty({ description: 'Is system product candidate', example: true, required: true })
  public isSystem: boolean

  @Expose()
  @ApiProperty({ description: 'Usage count in recipes', example: 124, required: true })
  public usageCount: number

  @Expose()
  @ApiProperty({
    description: 'Optional AI explanation for substitution candidate',
    example: 'Similar starchy texture and roasting behavior.',
    required: false,
    nullable: true,
  })
  public reason?: string | null

  public constructor(data: RecipeSubstitutionItem) {
    Object.assign(this, data)
  }

  public static from(data: RecipeSubstitutionItem): RecipeSubstitutionItemApiModel {
    return new this(data)
  }

  public static fromList(data: RecipeSubstitutionItem[]): RecipeSubstitutionItemApiModel[] {
    return data.map((item) => this.from(item))
  }
}
