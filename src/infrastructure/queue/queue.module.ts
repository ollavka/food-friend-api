import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, getConfigToken } from '@nestjs/config'
import { BackgroundJobModule } from '@core/background-job'
import { REDIS_ENV_CONFIG_KEY, RedisEnvConfig, redisEnvConfig } from './config'
import { BACKGROUND_JOBS_QUEUE_NAME } from './constant'
import { DispatchBackgroundJobsJob } from './job'
import { BackgroundJobsProcessor } from './processor'

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(redisEnvConfig),
    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(redisEnvConfig)],
      useFactory: (config: RedisEnvConfig) => ({
        connection: {
          host: config.host,
          port: config.port,
          ...(config.password ? { password: config.password } : {}),
          ...(config.db !== undefined ? { db: config.db } : {}),
        },
      }),
      inject: [getConfigToken(REDIS_ENV_CONFIG_KEY)],
    }),
    BullModule.registerQueue({
      name: BACKGROUND_JOBS_QUEUE_NAME,
    }),
    BackgroundJobModule,
  ],
  providers: [DispatchBackgroundJobsJob, BackgroundJobsProcessor],
  exports: [BullModule],
})
export class QueueModule {}
