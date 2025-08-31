import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { filters } from '@common/filter/all'
import { interceptors } from '@common/interceptor/all'
import { pipes } from '@common/pipe/all'
import { configModuleOptions } from '@config/app'
import { AuthModule } from '@core/auth'
import { UserModule } from '@core/user'
import { BcryptModule } from '@infrastructure/cryptography'
import { PrismaModule } from '@infrastructure/database'
import { LocalizationModule } from '@infrastructure/localization'
import { MailModule } from '@infrastructure/mail'
import { OtpModule } from '@infrastructure/otp'
import { SchedulerModule } from '@infrastructure/scheduler'

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    LocalizationModule,
    SchedulerModule,
    PrismaModule,
    BcryptModule,
    AuthModule,
    UserModule,
    OtpModule,
    MailModule,
  ],
  providers: [...pipes, ...interceptors, ...filters],
})
export class AppModule {}
