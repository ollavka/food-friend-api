import { IsNotEmpty, IsNumberString, IsString } from 'class-validator'
import { IsEmail } from '@common/validation'

export class MailEnvSchema {
  @IsNotEmpty()
  @IsString()
  public readonly MAIL_SMTP_HOST: string

  @IsNotEmpty()
  @IsNumberString()
  public readonly MAIL_SMTP_PORT: string

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  public readonly MAIL_SMTP_EMAIL: string

  @IsNotEmpty()
  @IsString()
  public readonly MAIL_SMTP_PASSWORD: string

  @IsNotEmpty()
  @IsString()
  public readonly RESEND_API_KEY: string

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  public readonly RESEND_FROM_EMAIL: string

  @IsNotEmpty()
  @IsString()
  public readonly RESEND_FROM_NAME: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MailEnvSchema {}
  }
}
