import { Controller, Get, Param } from '@nestjs/common'
import { User } from '@prisma/client'
import { Authorization } from '@access-control/decorator'
import { AuthorizedUser } from '@common/decorator'
import { UserEntity } from '@common/entity'
import { AppEntityNotFoundException } from '@common/exception'
import { HashToUuidPipe } from '@common/pipe'
import { Uuid } from '@common/type'
import { UserService } from '../service'

@Controller('users')
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Authorization()
  @Get('me')
  public getMe(@AuthorizedUser() user: User): UserEntity {
    return UserEntity.from(user)
  }

  @Authorization()
  @Get(':id')
  public async getUser(@Param('id', HashToUuidPipe) id: Uuid): Promise<UserEntity> {
    const user = await this.userService.findById(id)

    if (!user) {
      throw new AppEntityNotFoundException('User', { id })
    }

    return UserEntity.from(user)
  }
}
