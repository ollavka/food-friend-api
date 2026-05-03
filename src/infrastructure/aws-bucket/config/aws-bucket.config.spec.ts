import { S3Client } from '@aws-sdk/client-s3'
import { describe, expect, it } from '@jest/globals'
import { awsBucketEnvConfig, awsBucketModuleProviders } from './aws-bucket.config'
import { AWS_BUCKET_CLIENT_TOKEN, AWS_BUCKET_NAME_TOKEN, AWS_BUCKET_REGION_TOKEN } from './constant'

describe('awsBucketEnvConfig', () => {
  const setEnvVar = (key: string, value: string | undefined): void => {
    Object.defineProperty(process.env, key, {
      value,
      configurable: true,
    })
  }

  it('should map aws env vars', () => {
    setEnvVar('AWS_ACCESS_KEY_ID', 'access-key')
    setEnvVar('AWS_SECRET_ACCESS_KEY', 'secret-key')
    setEnvVar('AWS_S3_REGION', 'eu-central-1')
    setEnvVar('AWS_S3_BUCKET_NAME', 'food-friend-bucket')

    expect(awsBucketEnvConfig()).toEqual({
      awsAccessKeyId: 'access-key',
      awsSecretAccessKey: 'secret-key',
      awsS3Region: 'eu-central-1',
      awsS3BucketName: 'food-friend-bucket',
    })
  })
})

describe('awsBucketModuleProviders', () => {
  const getProvider = (token: symbol): any =>
    (awsBucketModuleProviders as Array<{ provide: unknown }>).find((provider) => provider.provide === token)

  it('should build s3 client and expose region/bucket providers', () => {
    const config = {
      awsS3Region: 'eu-central-1',
      awsS3BucketName: 'food-friend-bucket',
    }

    const clientProvider = getProvider(AWS_BUCKET_CLIENT_TOKEN)
    const nameProvider = getProvider(AWS_BUCKET_NAME_TOKEN)
    const regionProvider = getProvider(AWS_BUCKET_REGION_TOKEN)

    expect(clientProvider.useFactory(config)).toBeInstanceOf(S3Client)
    expect(nameProvider.useFactory(config)).toBe('food-friend-bucket')
    expect(regionProvider.useFactory(config)).toBe('eu-central-1')
  })

  it('should throw when required region or bucket is missing', () => {
    const clientProvider = getProvider(AWS_BUCKET_CLIENT_TOKEN)
    const nameProvider = getProvider(AWS_BUCKET_NAME_TOKEN)
    const regionProvider = getProvider(AWS_BUCKET_REGION_TOKEN)

    expect(() => clientProvider.useFactory({ awsS3Region: undefined })).toThrow('AWS_S3_REGION is missing')
    expect(() => nameProvider.useFactory({ awsS3BucketName: undefined })).toThrow('AWS_S3_BUCKET_NAME is missing')
    expect(() => regionProvider.useFactory({ awsS3Region: undefined })).toThrow('AWS_S3_REGION is missing')
  })
})
