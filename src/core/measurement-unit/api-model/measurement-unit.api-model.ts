import { ApiProperty } from '@nestjs/swagger'
import { MeasurementBaseTypeKey, MeasurementUnit } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class MeasurementUnitApiModel {
  @Expose()
  @ApiProperty({
    description: 'Measurement unit key',
    example: 'KG',
    required: true,
  })
  public key: MeasurementBaseTypeKey

  @Expose()
  @ApiProperty({
    description: 'Measurement unit label',
    example: 'kg',
    required: true,
  })
  public label: string

  @Expose()
  @ApiProperty({
    description: 'Is base unit',
    example: true,
    required: true,
  })
  public isBaseUnit: boolean

  @Expose()
  @ApiProperty({
    description: 'Is user selectable',
    example: true,
    required: true,
  })
  public isUserSelectable: boolean

  public constructor(unit: Partial<MeasurementUnit>) {
    Object.assign(this, unit)
  }

  public static from(unit: Partial<MeasurementUnit>): MeasurementUnitApiModel {
    return new this(unit)
  }

  public static fromList(units: Array<Partial<MeasurementUnit>>): MeasurementUnitApiModel[] {
    return units.map((unit) => this.from(unit))
  }
}
