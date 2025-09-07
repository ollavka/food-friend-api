import { Module } from '@nestjs/common'
import { UserModule } from '@core/user'
import { PasswordManagementController } from './controller'
import { ResetPasswordSessionRepository } from './repository'
import { PasswordManagementService } from './service'

@Module({
  imports: [UserModule],
  controllers: [PasswordManagementController],
  providers: [PasswordManagementService, ResetPasswordSessionRepository],
})
export class PasswordManagementModule {}
