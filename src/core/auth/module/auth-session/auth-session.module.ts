import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { UserModule } from '@core/user'
import { jwtModuleConfig } from '../../config/jwt'
import { JwtRepository } from './repository'
import { AuthSessionService } from './service'

@Module({
  imports: [UserModule, JwtModule.registerAsync(jwtModuleConfig)],
  providers: [AuthSessionService, JwtRepository],
  exports: [AuthSessionService, JwtModule],
})
export class AuthSessionModule {}
