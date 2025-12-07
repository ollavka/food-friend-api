import { ApiProperty } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { IsOptional } from 'class-validator'
import { IsBoolean, IsEnum } from '@common/validation'

export class MeasurementUnitFilterQueryDto {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description:
      'Is base unit of each measurement type. If undefined is passed, all units will be taken; otherwise, filtering will be performed based on the Boolean value.',
    example: true,
  })
  public isBaseUnit?: boolean

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Is available for user view', example: true })
  public isUserSelectable?: boolean

  @IsOptional()
  @IsEnum(MeasurementBaseTypeKey)
  @ApiProperty({
    description:
      'Measurement base type of unit. If undefined is passed, all units will be taken; otherwise, filtering will be performed based on the type value.',
    enum: MeasurementBaseTypeKey,
    example: MeasurementBaseTypeKey.MASS,
  })
  public baseType?: MeasurementBaseTypeKey
}
