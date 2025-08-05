import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { interceptors } from '@common/interceptor/all'
import { pipes } from '@common/pipe/all'
import { configModuleOptions } from '@config/options'
import { AuthModule } from '@core/auth'
import { BcryptModule } from '@infrastructure/cryptography'
import { PrismaModule } from '@infrastructure/database'

@Module({
  imports: [ConfigModule.forRoot(configModuleOptions), PrismaModule, BcryptModule, AuthModule],
  providers: [...pipes, ...interceptors],
})
export class AppModule {}
