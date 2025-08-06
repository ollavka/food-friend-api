import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { UserModule } from '@core/user'
import { jwtModuleConfig } from './config/jwt'
import { AuthController } from './controller'
import { JwtRepository } from './repository'
import { AuthService } from './service'

@Module({
  imports: [JwtModule.registerAsync(jwtModuleConfig), UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtRepository],
})
export class AuthModule {}
