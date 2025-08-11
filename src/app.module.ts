import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { filters } from '@common/filter/all'
import { interceptors } from '@common/interceptor/all'
import { pipes } from '@common/pipe/all'
import { configModuleOptions } from '@config/app/options'
import { AuthModule } from '@core/auth'
import { UserModule } from '@core/user'
import { BcryptModule } from '@infrastructure/cryptography'
import { PrismaModule } from '@infrastructure/database'
import { SchedulerModule } from '@infrastructure/scheduler'

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    SchedulerModule,
    PrismaModule,
    BcryptModule,
    AuthModule,
    UserModule,
  ],
  providers: [...pipes, ...interceptors, ...filters],
})
export class AppModule {}
