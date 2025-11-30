import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LanguageModule } from '@core/language'
import { UserModule } from '@core/user'
import { AuthSessionModule } from '../../auth-session'
import { ProviderAccountModule } from '../../provider-account'
import { googleProviderEnvConfig, googleProviderModuleProviders } from './config'
import { GoogleProviderController } from './controller'
import { GoogleProviderService } from './service'

@Module({
  imports: [
    ConfigModule.forFeature(googleProviderEnvConfig),
    AuthSessionModule,
    ProviderAccountModule,
    UserModule,
    LanguageModule,
  ],
  controllers: [GoogleProviderController],
  providers: [GoogleProviderService, ...googleProviderModuleProviders],
  exports: [...googleProviderModuleProviders],
})
export class GoogleProviderModule {}
