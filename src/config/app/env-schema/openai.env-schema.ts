import { IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator'

export class OpenAiEnvSchema {
  @IsNotEmpty()
  @IsString()
  public readonly OPENAI_API_KEY: string

  @IsOptional()
  @IsString()
  public readonly OPENAI_BASE_URL?: string

  @IsNotEmpty()
  @IsString()
  public readonly OPENAI_TEXT_MODEL: string

  @IsOptional()
  @IsString()
  public readonly OPENAI_VISION_MODEL?: string

  @IsOptional()
  @IsString()
  public readonly OPENAI_IMAGE_MODEL?: string

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  public readonly OPENAI_TIMEOUT_MS: string

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  public readonly OPENAI_MAX_RETRIES: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends OpenAiEnvSchema {}
  }
}
