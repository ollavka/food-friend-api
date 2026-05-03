import { describe, expect, it } from '@jest/globals'
import { envSchemaValidator } from './env-schema.validator'

describe('envSchemaValidator', () => {
  const validConfig = {
    NODE_ENV: 'development',
    APP_PORT: '3000',
    APP_HOST: '0.0.0.0',
    ALLOWED_ORIGINS: 'http://localhost:3000',
    HASH_PEPPER: 'pepper',
    LOG_ERROR: 'true',
    LOG_WARNING: 'true',
    LOG_INFO: 'true',
    LOG_DEBUG: 'false',
    LOG_VERBOSE: 'false',
    POSTGRES_USER: 'postgres',
    POSTGRES_PASSWORD: 'secret',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5432',
    POSTGRES_DB_NAME: 'food_friend',
    DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/food_friend',
    JWT_SECRET_KEY: 'jwt-secret',
    JWT_ACCESS_TOKEN_TTL: '1h',
    JWT_REFRESH_TOKEN_TTL: '7d',
    MAIL_SMTP_HOST: 'smtp.local',
    MAIL_SMTP_PORT: '587',
    MAIL_SMTP_EMAIL: 'mail@example.com',
    MAIL_SMTP_PASSWORD: 'mail-password',
    RESEND_API_KEY: 'resend-api-key',
    RESEND_FROM_EMAIL: 'noreply@example.com',
    RESEND_FROM_NAME: 'Food Friend',
    RESEND_TO_EMAIL: 'support@example.com',
    GOOGLE_CLIENT_ID: 'google-client-id',
    GOOGLE_CLIENT_SECRET: 'google-client-secret',
    AWS_ACCESS_KEY_ID: 'aws-key',
    AWS_SECRET_ACCESS_KEY: 'aws-secret',
    AWS_S3_REGION: 'eu-central-1',
    AWS_S3_BUCKET_NAME: 'bucket',
    REDIS_HOST: '127.0.0.1',
    REDIS_PORT: '6379',
    OPENAI_API_KEY: 'openai-key',
    OPENAI_TEXT_MODEL: 'gpt-4.1-mini',
    OPENAI_TIMEOUT_MS: '30000',
    OPENAI_MAX_RETRIES: '2',
    MEILISEARCH_HOST: 'http://127.0.0.1:7700',
  }

  it('should return config when all schemas are valid', () => {
    const config = envSchemaValidator(validConfig)
    expect(config).toBe(validConfig)
  })

  it('should throw when config has invalid values', () => {
    const invalidConfig = {
      ...validConfig,
      DATABASE_URL: 'https://not-postgres.local',
      OPENAI_TIMEOUT_MS: '-1',
    }

    expect(() => envSchemaValidator(invalidConfig)).toThrow('Config validation error:')
  })
})
