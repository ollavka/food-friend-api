import { IsNotEmpty, IsNumberString, IsString } from 'class-validator'
import { IsPostgresURL } from '@common/validation'

export class PostgresEnvSchema {
  @IsNotEmpty()
  @IsString()
  public readonly POSTGRES_USER: string

  @IsNotEmpty()
  @IsString()
  public readonly POSTGRES_PASSWORD: string

  @IsNotEmpty()
  @IsString()
  public readonly POSTGRES_HOST: string

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  public readonly POSTGRES_PORT: string

  @IsNotEmpty()
  @IsString()
  public readonly POSTGRES_DB_NAME: string

  @IsNotEmpty()
  @IsPostgresURL()
  public readonly DATABASE_URL: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends PostgresEnvSchema {}
  }
}
