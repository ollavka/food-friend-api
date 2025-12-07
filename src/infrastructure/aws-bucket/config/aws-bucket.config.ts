import { S3Client } from '@aws-sdk/client-s3'
import { Provider } from '@nestjs/common'
import { getConfigToken, registerAs } from '@nestjs/config'
import {
  AWS_BUCKET_CLIENT_TOKEN,
  AWS_BUCKET_ENV_CONFIG_KEY,
  AWS_BUCKET_NAME_TOKEN,
  AWS_BUCKET_REGION_TOKEN,
} from './constant'
import { AWSBucketEnvConfig } from './type'

export const awsBucketEnvConfig: () => AWSBucketEnvConfig = registerAs(AWS_BUCKET_ENV_CONFIG_KEY, () => ({
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsS3Region: process.env.AWS_S3_REGION,
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
}))

function getAWSBucketClientFactory(config: AWSBucketEnvConfig): S3Client {
  const { awsS3Region } = config

  if (!awsS3Region) {
    throw new Error('AWS_S3_REGION is missing')
  }

  const awsBucketClient = new S3Client({ region: awsS3Region })
  return awsBucketClient
}

function getAWSBucketNameFactory(config: AWSBucketEnvConfig): string {
  const { awsS3BucketName } = config

  if (!awsS3BucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is missing')
  }

  return awsS3BucketName
}

function getAWSBucketRegionFactory(config: AWSBucketEnvConfig): string {
  const { awsS3Region } = config

  if (!awsS3Region) {
    throw new Error('AWS_S3_REGION is missing')
  }

  return awsS3Region
}

export const awsBucketModuleProviders: Provider[] = [
  {
    provide: AWS_BUCKET_CLIENT_TOKEN,
    useFactory: getAWSBucketClientFactory,
    inject: [getConfigToken(AWS_BUCKET_ENV_CONFIG_KEY)],
  },
  {
    provide: AWS_BUCKET_NAME_TOKEN,
    useFactory: getAWSBucketNameFactory,
    inject: [getConfigToken(AWS_BUCKET_ENV_CONFIG_KEY)],
  },
  {
    provide: AWS_BUCKET_REGION_TOKEN,
    useFactory: getAWSBucketRegionFactory,
    inject: [getConfigToken(AWS_BUCKET_ENV_CONFIG_KEY)],
  },
]
