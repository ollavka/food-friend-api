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
  @IsEmail()
  public readonly MAIL_SMTP_EMAIL: string

  @IsNotEmpty()
  @IsString()
  public readonly MAIL_SMTP_PASSWORD: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MailEnvSchema {}
  }
}
