import { Body, Controller, Get, Param, Patch } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { Authorization } from '@access-control/decorator'
import { AuthUser } from '@common/decorator'
import { AppEntityNotFoundException } from '@common/exception'
import { HashToUuidPipe } from '@common/pipe'
import { Uuid } from '@common/type'
import { UserApiModel, UserNutritionProfileApiModel } from '../api-model'
import { GetCurrentUserDocs, GetUserByIdDocs, UpdateUserNutritionProfileDocs } from '../docs'
import { UpdateUserNutritionProfileDto } from '../dto'
import { UserService } from '../service'

@ApiTags('Users')
@ApiExtraModels(UserApiModel, UserNutritionProfileApiModel)
@Controller('users')
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Authorization()
  @Get('me')
  @GetCurrentUserDocs()
  public getMe(@AuthUser() user: User): UserApiModel {
    return UserApiModel.from(user)
  }

  @Authorization()
  @Get(':id')
  @GetUserByIdDocs()
  public async getUser(@Param('id', HashToUuidPipe) id: Uuid): Promise<UserApiModel> {
    const user = await this.userService.findById(id)

    if (!user) {
      throw new AppEntityNotFoundException('User', { id })
    }

    return UserApiModel.from(user)
  }

  @Authorization()
  @Patch('me/nutrition-profile')
  @UpdateUserNutritionProfileDocs()
  public async upsertNutritionProfile(
    @AuthUser() user: User,
    @Body() dto: UpdateUserNutritionProfileDto,
  ): Promise<UserNutritionProfileApiModel> {
    const profile = await this.userService.upsertNutritionProfile(user.id, {
      sex: dto.sex,
      age: dto.age,
      heightCm: dto.heightCm,
      weightKg: dto.weightKg,
      activityLevel: dto.activityLevel,
      goal: dto.goal,
      targetCalories: dto.targetCalories,
    })

    return UserNutritionProfileApiModel.from(profile)
  }
}
