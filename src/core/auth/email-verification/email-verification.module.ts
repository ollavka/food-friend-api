import { Module, forwardRef } from '@nestjs/common'
import { UserModule } from '@core/user'
import { AuthModule } from '../auth.module'
import { EmailVerificationController } from './controller'
import { EmailVerificationService } from './service'

@Module({
  imports: [forwardRef(() => AuthModule), UserModule],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
