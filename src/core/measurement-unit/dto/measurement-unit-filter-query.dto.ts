import { ApiPropertyOptional } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { IsOptional } from 'class-validator'
import { IsBoolean, IsEnum } from '@common/validation'

export class MeasurementUnitFilterQueryDto {
  @ApiPropertyOptional({
    description:
      'Is base unit of each measurement type. If undefined is passed, all units will be taken; otherwise, filtering will be performed based on the Boolean value.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  public isBaseUnit?: boolean

  @ApiPropertyOptional({
    description: 'Is available unit for user view',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  public isUserSelectable?: boolean

  @ApiPropertyOptional({
    description:
      'Measurement base type of unit. If undefined is passed, all units will be taken; otherwise, filtering will be performed based on the type value.',
    enum: MeasurementBaseTypeKey,
    example: MeasurementBaseTypeKey.MASS,
  })
  @IsOptional()
  @IsEnum(MeasurementBaseTypeKey)
  public baseType?: MeasurementBaseTypeKey
}
