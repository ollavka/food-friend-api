import { IsNotEmpty, IsString } from 'class-validator'

export class AWSSchema {
  @IsNotEmpty()
  @IsString()
  public readonly AWS_ACCESS_KEY_ID: string

  @IsNotEmpty()
  @IsString()
  public readonly AWS_SECRET_ACCESS_KEY: string

  @IsNotEmpty()
  @IsString()
  public readonly AWS_S3_REGION: string

  @IsNotEmpty()
  @IsString()
  public readonly AWS_S3_BUCKET_NAME: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends AWSSchema {}
  }
}
