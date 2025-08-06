import { Controller } from '@nestjs/common'
import { UserService } from '../service'

@Controller('users')
export class UserController {
  public constructor(private readonly userService: UserService) {}
}
