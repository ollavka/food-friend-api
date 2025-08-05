import { Module } from '@nestjs/common'
import { AuthController } from './controller'
import { AuthService } from './service'

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
