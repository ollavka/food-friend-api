import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class MeilisearchEnvSchema {
  @IsNotEmpty()
  @IsString()
  public readonly MEILISEARCH_HOST: string

  @IsOptional()
  @IsString()
  public readonly MEILISEARCH_API_KEY?: string

  @IsOptional()
  @IsString()
  public readonly MEILISEARCH_PRODUCTS_INDEX?: string

  @IsOptional()
  @IsString()
  public readonly MEILISEARCH_RECIPES_INDEX?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MeilisearchEnvSchema {}
  }
}
