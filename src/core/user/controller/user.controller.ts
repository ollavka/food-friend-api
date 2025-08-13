import { Controller, Get, Param } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { Authorization } from '@access-control/decorator'
import { UserApiModel } from '@common/api-model'
import { AuthorizedUser } from '@common/decorator'
import { AppEntityNotFoundException } from '@common/exception'
import { HashToUuidPipe } from '@common/pipe'
import { Uuid } from '@common/type'
import { MailService } from '@infrastructure/mail'
import { UserService } from '../service'

@ApiExcludeController()
@Controller('users')
export class UserController {
  public constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Authorization()
  @Get('me')
  public getMe(@AuthorizedUser() user: User): UserApiModel {
    return UserApiModel.from(user)
  }

  @Authorization()
  @Get(':id')
  public async getUser(@Param('id', HashToUuidPipe) id: Uuid): Promise<UserApiModel> {
    const user = await this.userService.findById(id)

    if (!user) {
      throw new AppEntityNotFoundException('User', { id })
    }

    return UserApiModel.from(user)
  }
}
