import { IsNotEmpty, IsString } from 'class-validator'

export class JwtEnvSchema {
  @IsNotEmpty()
  @IsString()
  public readonly JWT_SECRET_KEY: string

  @IsNotEmpty()
  @IsString()
  public readonly JWT_ACCESS_TOKEN_TTL: string

  @IsNotEmpty()
  @IsString()
  public readonly JWT_REFRESH_TOKEN_TTL: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends JwtEnvSchema {}
  }
}
