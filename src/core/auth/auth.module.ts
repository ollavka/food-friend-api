import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { LanguageModule } from '@core/language'
import { UserModule } from '@core/user'
import { AuthController } from './controller'
import { AuthSessionModule, EmailVerificationModule, PasswordManagementModule } from './module'
import { authProviderModules } from './module/auth-provider/all'
import { AuthService } from './service'
import { JwtStrategy } from './strategy'

@Module({
  imports: [
    PassportModule,
    UserModule,
    PasswordManagementModule,
    AuthSessionModule,
    EmailVerificationModule,
    LanguageModule,
    ...authProviderModules,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
