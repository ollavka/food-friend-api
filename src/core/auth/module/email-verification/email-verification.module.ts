import { Module } from '@nestjs/common'
import { UserModule } from '@core/user'
import { AuthSessionModule } from '../auth-session'
import { EmailVerificationController } from './controller'
import { EmailVerificationService } from './service'

@Module({
  imports: [AuthSessionModule, UserModule],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
