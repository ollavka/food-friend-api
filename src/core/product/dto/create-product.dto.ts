import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { IsOptional } from 'class-validator'
import { IsBoolean, IsEnum, IsId, IsNotEmpty, IsString } from '@common/validation'

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Product name', example: 'Potato', required: true })
  public name: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Product description', example: 'Fresh potato for cooking.' })
  public description?: string

  @IsEnum(MeasurementBaseTypeKey)
  @ApiProperty({
    description: 'Measurement base type of product',
    enum: MeasurementBaseTypeKey,
    example: MeasurementBaseTypeKey.MASS,
    required: true,
  })
  public measurementBaseType: MeasurementBaseTypeKey

  @IsOptional()
  @IsId()
  @ApiPropertyOptional({
    description: 'Default measurement unit ID',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
  })
  public measurementUnitId?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://bucket.s3.eu-north-1.amazonaws.com/p/1.jpg',
  })
  public imageUrl?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Product image key in S3',
    example: 'products/abc123-image.jpg',
  })
  public imageKey?: string

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Create product as system item (admin only)',
    example: false,
  })
  public isSystem?: boolean
}
