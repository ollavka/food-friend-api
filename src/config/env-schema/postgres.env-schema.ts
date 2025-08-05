import { IsNotEmpty, IsNumberString, IsString } from 'class-validator'
import { IsPostgresURL } from '@/common/validation'

export class PostgresEnvSchema {
  @IsString()
  @IsNotEmpty()
  public readonly POSTGRES_USER: string

  @IsString()
  @IsNotEmpty()
  public readonly POSTGRES_PASSWORD: string

  @IsString()
  @IsNotEmpty()
  public readonly POSTGRES_HOST: string

  @IsNumberString({ no_symbols: true })
  @IsNotEmpty()
  public readonly POSTGRES_PORT: string

  @IsString()
  @IsNotEmpty()
  public readonly POSTGRES_DB_NAME: string

  @IsPostgresURL()
  @IsNotEmpty()
  public readonly DATABASE_URL: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends PostgresEnvSchema {}
  }
}
