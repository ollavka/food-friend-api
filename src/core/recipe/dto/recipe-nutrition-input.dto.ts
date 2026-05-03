import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional } from 'class-validator'
import { IsMin } from '@common/validation'

export class RecipeNutritionInputDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsMin(0)
  @ApiPropertyOptional({ description: 'Calories (kcal)', example: 420 })
  public kcal?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsMin(0)
  @ApiPropertyOptional({ description: 'Proteins (g)', example: 18.5 })
  public proteins?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsMin(0)
  @ApiPropertyOptional({ description: 'Fats (g)', example: 12.3 })
  public fats?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsMin(0)
  @ApiPropertyOptional({ description: 'Carbs (g)', example: 55.7 })
  public carbs?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsMin(0)
  @ApiPropertyOptional({ description: 'Fiber (g)', example: 7.2 })
  public fiber?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsMin(0)
  @ApiPropertyOptional({ description: 'Sugar (g)', example: 4.1 })
  public sugar?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsMin(0)
  @ApiPropertyOptional({ description: 'Sodium (mg)', example: 560 })
  public sodiumMg?: number

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Is nutrition estimated by AI', example: false })
  public isEstimated?: boolean
}
