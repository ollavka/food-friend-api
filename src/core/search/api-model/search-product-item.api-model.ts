import { ApiProperty } from '@nestjs/swagger'
import { MeasurementBaseTypeKey, MeasurementUnitKey } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'

type SearchProductItem = {
  id: string
  slug: string
  name: string
  description?: string | null
  isSystem: boolean
  imageUrl?: string | null
  measurementBaseTypeKey: MeasurementBaseTypeKey
  measurementUnitKey?: MeasurementUnitKey | null
}

@Exclude()
export class SearchProductItemApiModel {
  @Expose()
  @ToId()
  @ApiProperty({ description: 'Product ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public id: Hash

  @Expose()
  @ApiProperty({ description: 'Product slug', example: 'potato', required: true })
  public slug: string

  @Expose()
  @ApiProperty({ description: 'Localized product name', example: 'Potato', required: true })
  public name: string

  @Expose()
  @ApiProperty({
    description: 'Localized product description',
    example: 'Fresh potato for cooking.',
    required: false,
    nullable: true,
  })
  public description?: string | null

  @Expose()
  @ApiProperty({
    description: 'Measurement base type key',
    enum: MeasurementBaseTypeKey,
    example: MeasurementBaseTypeKey.MASS,
    required: true,
  })
  public measurementBaseTypeKey: MeasurementBaseTypeKey

  @Expose()
  @ApiProperty({
    description: 'Measurement unit key',
    enum: MeasurementUnitKey,
    required: false,
    nullable: true,
    example: MeasurementUnitKey.KG,
  })
  public measurementUnitKey?: MeasurementUnitKey | null

  @Expose()
  @ApiProperty({
    description: 'Is system product',
    required: true,
    example: true,
  })
  public isSystem: boolean

  @Expose()
  @ApiProperty({
    description: 'Product image URL',
    required: false,
    nullable: true,
    example: 'https://bucket.s3.eu-north-1.amazonaws.com/products/abc.jpg',
  })
  public imageUrl?: string | null

  public constructor(item: SearchProductItem) {
    Object.assign(this, item)
  }

  public static from(item: SearchProductItem): SearchProductItemApiModel {
    return new this(item)
  }

  public static fromList(items: SearchProductItem[]): SearchProductItemApiModel[] {
    return items.map((item) => this.from(item))
  }
}
