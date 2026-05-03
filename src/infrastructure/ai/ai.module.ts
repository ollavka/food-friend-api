import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { openAiEnvConfig, openAiModuleProviders } from './config'
import { AI_PROVIDER_TOKEN } from './constant'
import { OpenAiProviderService } from './service'

@Global()
@Module({
  imports: [ConfigModule.forFeature(openAiEnvConfig)],
  providers: [
    ...openAiModuleProviders,
    OpenAiProviderService,
    {
      provide: AI_PROVIDER_TOKEN,
      useExisting: OpenAiProviderService,
    },
  ],
  exports: [AI_PROVIDER_TOKEN, OpenAiProviderService],
})
export class AiInfrastructureModule {}
