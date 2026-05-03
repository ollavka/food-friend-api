import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { NutritionActivityLevel, NutritionGoal, NutritionSex } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'
import { IsEnum, IsInt, IsMax, IsMin } from '@common/validation'

export class UpdateUserNutritionProfileDto {
  @IsEnum(NutritionSex)
  @ApiProperty({
    description: 'User biological sex for nutrition formula',
    enum: NutritionSex,
    example: NutritionSex.MALE,
    required: true,
  })
  public sex: NutritionSex

  @IsInt()
  @IsMin(12)
  @IsMax(100)
  @ApiProperty({
    description: 'User age',
    example: 28,
    required: true,
  })
  public age: number

  @IsInt()
  @IsMin(120)
  @IsMax(240)
  @ApiProperty({
    description: 'User height in centimeters',
    example: 178,
    required: true,
  })
  public heightCm: number

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsMin(30)
  @IsMax(300)
  @ApiProperty({
    description: 'User weight in kilograms',
    example: 79.5,
    required: true,
  })
  public weightKg: number

  @IsEnum(NutritionActivityLevel)
  @ApiProperty({
    description: 'User physical activity level',
    enum: NutritionActivityLevel,
    example: NutritionActivityLevel.MODERATE,
    required: true,
  })
  public activityLevel: NutritionActivityLevel

  @IsEnum(NutritionGoal)
  @ApiProperty({
    description: 'User nutrition goal',
    enum: NutritionGoal,
    example: NutritionGoal.MAINTAIN_WEIGHT,
    required: true,
  })
  public goal: NutritionGoal

  @IsOptional()
  @IsInt()
  @IsMin(800)
  @IsMax(6000)
  @ApiPropertyOptional({
    description: 'Manual daily calories target. If omitted, calculated from profile.',
    example: 2200,
  })
  public targetCalories?: number
}
