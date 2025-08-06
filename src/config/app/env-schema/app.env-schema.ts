import { IsBooleanString, IsEnum, IsNotEmpty, IsNumberString, IsString } from 'class-validator'
import { Environment } from '@common/enum'

export class AppEnvSchema {
  @IsEnum(Environment)
  public readonly NODE_ENV!: string

  @IsNumberString({ no_symbols: true })
  public readonly APP_PORT: string

  @IsNotEmpty()
  @IsString()
  public readonly APP_HOST: string

  @IsString()
  public readonly ALLOWED_ORIGINS: string

  @IsBooleanString()
  public readonly LOG_ERROR: string

  @IsBooleanString()
  public readonly LOG_WARNING: string

  @IsBooleanString()
  public readonly LOG_INFO: string

  @IsBooleanString()
  public readonly LOG_DEBUG: string

  @IsBooleanString()
  public readonly LOG_VERBOSE: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends AppEnvSchema {}
  }
}
