import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { UserModule } from '@core/user'
import { AuthController } from './controller'
import { AuthSessionModule, EmailVerificationModule, PasswordManagementModule } from './module'
import { AuthService } from './service'
import { JwtStrategy } from './strategy'

@Module({
  imports: [PassportModule, UserModule, PasswordManagementModule, AuthSessionModule, EmailVerificationModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
