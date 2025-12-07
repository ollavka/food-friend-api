import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Inject, Injectable } from '@nestjs/common'
import { AppInternalException } from '@common/exception'
import { MulterFile } from '@common/type'
import { randomHash } from '@common/util'
import { AWS_BUCKET_CLIENT_TOKEN, AWS_BUCKET_NAME_TOKEN, AWS_BUCKET_REGION_TOKEN } from '../config/constant'

@Injectable()
export class AWSBucketService {
  public constructor(
    @Inject(AWS_BUCKET_CLIENT_TOKEN) private readonly awsBucketClient: S3Client,
    @Inject(AWS_BUCKET_NAME_TOKEN) private readonly awsBucketName: string,
    @Inject(AWS_BUCKET_REGION_TOKEN) private readonly awsBucketRegion: string,
  ) {}

  public async upload(file: MulterFile, folder?: string): Promise<{ key: string; url: string }> {
    try {
      const { buffer, originalname, mimetype } = file
      const key = this.getFileKey(originalname, folder)
      const url = this.getFileUrl(key)

      await this.awsBucketClient.send(
        new PutObjectCommand({
          Bucket: this.awsBucketName,
          Key: key,
          Body: buffer,
          ContentType: mimetype,
        }),
      )

      return { key, url }
    } catch (_err) {
      throw new AppInternalException('aws-bucket.file-upload', 'An error occurred while uploading the file.')
    }
  }

  public async remove(key: string): Promise<void> {
    try {
      await this.awsBucketClient.send(
        new DeleteObjectCommand({
          Bucket: this.awsBucketName,
          Key: key,
        }),
      )
    } catch (_err) {
      throw new AppInternalException('aws-bucket.file-delete', 'An error occurred while removing the file.')
    }
  }

  public getFileKey(fileName: string, folder?: string): string {
    const uniqueFileName = `${randomHash()}-${fileName}`
    const parts = [folder, uniqueFileName]
    const key = parts.filter(Boolean).join('/')
    return key
  }

  public getFileUrl(key: string): string {
    return `https://${this.awsBucketName}.s3.${this.awsBucketRegion}.amazonaws.com/${key}`
  }
}
