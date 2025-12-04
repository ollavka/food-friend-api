import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { filters } from '@common/filter/all'
import { interceptors } from '@common/interceptor/all'
import { DefaultLanguageMiddleware } from '@common/middleware'
import { pipes } from '@common/pipe/all'
import { configModuleOptions } from '@config/app'
import { AuthModule } from '@core/auth'
import { LanguageModule } from '@core/language'
import { MeasurementBaseTypeModule } from '@core/measurement-base-type'
import { MeasurementUnitModule } from '@core/measurement-unit'
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
    LanguageModule,
    MeasurementBaseTypeModule,
    MeasurementUnitModule,
  ],
  providers: [...pipes, ...interceptors, ...filters],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(DefaultLanguageMiddleware).forRoutes('*')
  }
}
