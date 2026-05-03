import { ApiPropertyOptional } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { IsOptional } from 'class-validator'
import { IsBoolean, IsEnum, IsString } from '@common/validation'

export class ProductFilterQueryDto {
  @ApiPropertyOptional({
    description: 'Search by product name or slug',
    example: 'Potato',
  })
  @IsOptional()
  @IsString()
  public search?: string

  @ApiPropertyOptional({
    description:
      'Measurement base type of unit. If undefined is passed, products with all types will be taken; otherwise, filtering will be performed based on the type value.',
    enum: MeasurementBaseTypeKey,
    example: MeasurementBaseTypeKey.MASS,
  })
  @IsOptional()
  @IsEnum(MeasurementBaseTypeKey)
  public measurementBaseType?: MeasurementBaseTypeKey

  @ApiPropertyOptional({
    description: 'Is system product. If undefined is passed, all products will be returned.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  public isSystem?: boolean
}
