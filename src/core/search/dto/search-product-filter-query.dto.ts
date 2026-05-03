import { ApiPropertyOptional } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { IsOptional } from 'class-validator'
import { IsBoolean, IsEnum, IsString } from '@common/validation'

export class SearchProductFilterQueryDto {
  @ApiPropertyOptional({
    description: 'Search by product localized name or slug',
    example: 'potato',
  })
  @IsOptional()
  @IsString()
  public search?: string

  @ApiPropertyOptional({
    description: 'Filter products by measurement base type',
    enum: MeasurementBaseTypeKey,
    example: MeasurementBaseTypeKey.MASS,
  })
  @IsOptional()
  @IsEnum(MeasurementBaseTypeKey)
  public measurementBaseType?: MeasurementBaseTypeKey

  @ApiPropertyOptional({
    description: 'Filter by system product flag',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  public isSystem?: boolean
}
