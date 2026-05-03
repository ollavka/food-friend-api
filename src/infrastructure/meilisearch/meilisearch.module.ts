import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { meilisearchEnvConfig } from './config'
import { MeilisearchService } from './service'

@Global()
@Module({
  imports: [ConfigModule.forFeature(meilisearchEnvConfig)],
  providers: [MeilisearchService],
  exports: [MeilisearchService],
})
export class MeilisearchModule {}
