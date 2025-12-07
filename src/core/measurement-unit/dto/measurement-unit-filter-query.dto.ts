import { ApiHideProperty } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { IsOptional } from 'class-validator'
import { IsBoolean, IsEnum } from '@common/validation'

export class MeasurementUnitFilterQueryDto {
  @IsOptional()
  @IsBoolean()
  @ApiHideProperty()
  public isBaseUnit?: boolean

  @IsOptional()
  @IsBoolean()
  @ApiHideProperty()
  public isUserSelectable?: boolean

  @IsOptional()
  @IsEnum(MeasurementBaseTypeKey)
  @ApiHideProperty()
  public baseType?: MeasurementBaseTypeKey
}
