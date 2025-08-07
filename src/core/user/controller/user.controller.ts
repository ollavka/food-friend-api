import { Controller, Get } from '@nestjs/common'
import { User } from '@prisma/client'
import { Authorization } from '@access-control/decorator'
import { AuthorizedUser } from '@common/decorator'
import { UserService } from '../service'

@Controller('users')
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Authorization()
  @Get('me')
  public me(@AuthorizedUser() user: User): User {
    return user
  }
}
