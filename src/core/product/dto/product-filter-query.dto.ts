import { ApiHideProperty } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { IsOptional } from 'class-validator'
import { IsEnum, IsString } from '@common/validation'

export class ProductFilterQueryDto {
  @IsOptional()
  @IsString()
  @ApiHideProperty()
  // @ApiProperty({
  //   description: 'Search by product name or slug',
  //   example: 'Potato',
  // })
  public search?: string

  @IsOptional()
  @IsEnum(MeasurementBaseTypeKey)
  @ApiHideProperty()
  // @ApiProperty({
  //   description:
  //     'Measurement base type of unit. If undefined is passed, products with all types will be taken; otherwise, filtering will be performed based on the type value.',
  //   enum: MeasurementBaseTypeKey,
  //   example: MeasurementBaseTypeKey.MASS,
  // })
  public measurementBaseType?: MeasurementBaseTypeKey
}
