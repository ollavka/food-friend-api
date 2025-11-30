import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { postgresDatabaseEnvConfig, postgresDatabaseProviders } from './config'
import { PrismaService } from './service'

@Global()
@Module({
  imports: [ConfigModule.forFeature(postgresDatabaseEnvConfig)],
  providers: [PrismaService, ...postgresDatabaseProviders],
  exports: [PrismaService],
})
export class PrismaModule {}
