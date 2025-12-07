import { ApiProperty } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { IsString, ToId } from '@common/validation'
import { ProductWithTranslation } from '../type'

@Exclude()
export class ProductApiModel {
  @Expose()
  @ToId()
  @ApiProperty({
    description: 'Product ID',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public id: Hash

  @Expose()
  @IsString()
  @ApiProperty({
    description: 'Product slug',
    example: 'potato',
    required: true,
  })
  public slug: string

  @Expose()
  @ApiProperty({
    description: 'Product name',
    example: 'Potato',
    required: true,
  })
  public name: string

  @Expose()
  @ApiProperty({
    description: 'Measurement base type key',
    example: 'MASS',
    required: true,
  })
  public measurementBaseType: MeasurementBaseTypeKey

  @Expose()
  @ApiProperty({
    description: 'Product created at date',
    example: new Date(),
    required: true,
  })
  public createdAt: Date

  @Expose()
  @ApiProperty({
    description: 'Product updated at date',
    example: new Date(),
    required: true,
  })
  public updatedAt: Date

  public constructor(product: Partial<ProductWithTranslation>) {
    Object.assign(this, product)
    const measurementBaseTypeKey = product.measurementBaseType?.key

    if (measurementBaseTypeKey) {
      this.measurementBaseType = measurementBaseTypeKey
    }
  }

  public static from(product: Partial<ProductWithTranslation>): ProductApiModel {
    return new this(product)
  }

  public static fromList(products: Array<Partial<ProductWithTranslation>>): ProductApiModel[] {
    return products.map((product) => this.from(product))
  }
}
