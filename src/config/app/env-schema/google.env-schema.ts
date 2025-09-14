import { IsNotEmpty, IsString } from 'class-validator'

export class GoogleSchema {
  @IsNotEmpty()
  @IsString()
  public readonly GOOGLE_CLIENT_ID: string

  @IsNotEmpty()
  @IsString()
  public readonly GOOGLE_CLIENT_SECRET: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends GoogleSchema {}
  }
}
