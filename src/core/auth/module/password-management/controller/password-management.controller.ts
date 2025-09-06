import { Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PasswordManagementService } from '../service'

@ApiTags('Auth')
@Controller('auth/password')
export class PasswordManagementController {
  public constructor(private readonly passwordManagementService: PasswordManagementService) {}

  @Post('reset')
  public async resetPassword(): Promise<void> {}

  @Post('reset/confirm')
  public async confirmResetPassword(): Promise<void> {}

  @Post('change')
  public async changePassword(): Promise<void> {}
}
