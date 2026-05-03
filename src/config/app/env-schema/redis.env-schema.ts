import { IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator'

export class RedisEnvSchema {
  @IsNotEmpty()
  @IsString()
  public readonly REDIS_HOST: string

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  public readonly REDIS_PORT: string

  @IsOptional()
  @IsString()
  public readonly REDIS_PASSWORD?: string

  @IsOptional()
  @IsNumberString({ no_symbols: true })
  public readonly REDIS_DB?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends RedisEnvSchema {}
  }
}
