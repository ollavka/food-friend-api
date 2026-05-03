import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { filters } from '@common/filter/all'
import { interceptors } from '@common/interceptor/all'
import { DefaultLanguageMiddleware } from '@common/middleware'
import { pipes } from '@common/pipe/all'
import { configModuleOptions } from '@config/app'
import { AuthModule } from '@core/auth'
import { BackgroundJobModule } from '@core/background-job'
import { LanguageModule } from '@core/language'
import { MeasurementBaseTypeModule } from '@core/measurement-base-type'
import { MeasurementUnitModule } from '@core/measurement-unit'
import { ProductModule } from '@core/product'
import { RecipeModule } from '@core/recipe'
import { RecipeDifficultyModule } from '@core/recipe-difficulty'
import { SearchModule } from '@core/search'
import { ShoppingListModule } from '@core/shopping-list'
import { UserModule } from '@core/user'
import { AiInfrastructureModule } from '@infrastructure/ai'
import { AWSBucketModule } from '@infrastructure/aws-bucket'
import { BcryptModule } from '@infrastructure/cryptography'
import { PrismaModule } from '@infrastructure/database'
import { LocalizationModule } from '@infrastructure/localization'
import { MailModule } from '@infrastructure/mail'
import { MeilisearchModule } from '@infrastructure/meilisearch'
import { OtpModule } from '@infrastructure/otp'
import { PaginationModule } from '@infrastructure/pagination'
import { QueueModule } from '@infrastructure/queue'
import { SchedulerModule } from '@infrastructure/scheduler'

const isOpenApiGeneration = process.env.OPENAPI_GENERATE === 'true'

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    LocalizationModule,
    SchedulerModule,
    PrismaModule,
    AiInfrastructureModule,
    MeilisearchModule,
    ...(isOpenApiGeneration ? [] : [QueueModule]),
    BcryptModule,
    AuthModule,
    UserModule,
    OtpModule,
    MailModule,
    AWSBucketModule,
    PaginationModule,
    LanguageModule,
    MeasurementBaseTypeModule,
    MeasurementUnitModule,
    RecipeDifficultyModule,
    RecipeModule,
    SearchModule,
    ProductModule,
    ShoppingListModule,
    BackgroundJobModule,
  ],
  providers: [...pipes, ...interceptors, ...filters],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(DefaultLanguageMiddleware).forRoutes('*')
  }
}
