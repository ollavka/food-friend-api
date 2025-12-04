import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { IsBoolean } from '@common/validation'

export class MeasurementUnitFilterQueryDto {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Is base unit', example: true, required: true })
  public isBaseUnit?: boolean

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Is user selectable', example: true, required: true })
  public isUserSelectable?: boolean
}
