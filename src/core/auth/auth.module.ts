import { Module, forwardRef } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UserModule } from '@core/user'
import { jwtModuleConfig } from './config/jwt'
import { AuthController } from './controller'
import { EmailVerificationModule } from './module'
import { JwtRepository } from './repository'
import { AuthService } from './service'
import { JwtStrategy } from './strategy'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync(jwtModuleConfig),
    forwardRef(() => EmailVerificationModule),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtRepository, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
