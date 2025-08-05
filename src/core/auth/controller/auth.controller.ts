import { Controller, Get } from '@nestjs/common'
import { AuthService } from '../service'

@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Get()
  public getData(): string {
    return '124523433'
  }
}
