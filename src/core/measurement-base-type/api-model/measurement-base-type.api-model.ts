import { ApiProperty } from '@nestjs/swagger'
import { MeasurementBaseType, MeasurementBaseTypeKey } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class MeasurementBaseTypeApiModel {
  @Expose()
  @ApiProperty({
    description: 'Measurement base type key',
    example: 'MASS',
    required: true,
  })
  public key: MeasurementBaseTypeKey

  @Expose()
  @ApiProperty({
    description: 'Measurement base type label',
    example: 'Mass',
    required: true,
  })
  public label: string

  public constructor(partial: Partial<MeasurementBaseType>) {
    Object.assign(this, partial)
  }

  public static from(baseType: Partial<MeasurementBaseType>): MeasurementBaseTypeApiModel {
    return new this(baseType)
  }

  public static fromList(baseTypes: Array<Partial<MeasurementBaseType>>): MeasurementBaseTypeApiModel[] {
    return baseTypes.map((baseTypes) => this.from(baseTypes))
  }
}
