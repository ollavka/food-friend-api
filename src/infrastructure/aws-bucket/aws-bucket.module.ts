import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { awsBucketEnvConfig, awsBucketModuleProviders } from './config'
import { AWSBucketService } from './service/aws-bucket.service'

@Global()
@Module({
  imports: [ConfigModule.forFeature(awsBucketEnvConfig)],
  providers: [...awsBucketModuleProviders, AWSBucketService],
  exports: [AWSBucketService],
})
export class AWSBucketModule {}
