import { ApiProperty } from '@nestjs/swagger'
import { NutritionActivityLevel, NutritionGoal, NutritionSex } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'
import { Hash } from '@common/type'
import { ToId } from '@common/validation'

type UserNutritionProfileData = {
  id: string
  userId: string
  sex: NutritionSex
  age: number
  heightCm: number
  weightKg: number
  activityLevel: NutritionActivityLevel
  goal: NutritionGoal
  targetCalories?: number | null
  createdAt: Date
  updatedAt: Date
}

@Exclude()
export class UserNutritionProfileApiModel {
  @Expose()
  @ToId()
  @ApiProperty({ description: 'Nutrition profile ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public id: Hash

  @Expose()
  @ToId()
  @ApiProperty({ description: 'User ID', example: 'LnT8BAUhhoJ2Y6MuB9AAZp', required: true })
  public userId: Hash

  @Expose()
  @ApiProperty({ description: 'User sex', enum: NutritionSex, required: true })
  public sex: NutritionSex

  @Expose()
  @ApiProperty({ description: 'User age', example: 28, required: true })
  public age: number

  @Expose()
  @ApiProperty({ description: 'User height in centimeters', example: 178, required: true })
  public heightCm: number

  @Expose()
  @ApiProperty({ description: 'User weight in kilograms', example: 79.5, required: true })
  public weightKg: number

  @Expose()
  @ApiProperty({ description: 'User activity level', enum: NutritionActivityLevel, required: true })
  public activityLevel: NutritionActivityLevel

  @Expose()
  @ApiProperty({ description: 'User nutrition goal', enum: NutritionGoal, required: true })
  public goal: NutritionGoal

  @Expose()
  @ApiProperty({ description: 'Manual daily calories target', example: 2200, required: false, nullable: true })
  public targetCalories?: number | null

  @Expose()
  @ApiProperty({ description: 'Profile created at', example: new Date(), required: true })
  public createdAt: Date

  @Expose()
  @ApiProperty({ description: 'Profile updated at', example: new Date(), required: true })
  public updatedAt: Date

  public constructor(profile: UserNutritionProfileData) {
    Object.assign(this, profile)
  }

  public static from(profile: UserNutritionProfileData): UserNutritionProfileApiModel {
    return new this(profile)
  }
}
