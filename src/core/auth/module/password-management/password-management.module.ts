import { Module } from '@nestjs/common'
import { UserModule } from '@core/user'
import { PasswordManagementController } from './controller'
import { PasswordManagementService } from './service'

@Module({
  imports: [UserModule],
  controllers: [PasswordManagementController],
  providers: [PasswordManagementService],
})
export class PasswordManagementModule {}
