import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { setupSwagger } from '@config/swagger'

function setupOpenApiEnv(): void {
  process.env.OPENAPI_GENERATE = 'true'

  const defaults: Record<string, string> = {
    REDIS_HOST: '127.0.0.1',
    REDIS_PORT: '6379',
    OPENAI_API_KEY: 'openapi-docs-dummy-key',
    OPENAI_TEXT_MODEL: 'gpt-4.1-mini',
    OPENAI_TIMEOUT_MS: '30000',
    OPENAI_MAX_RETRIES: '2',
    MEILISEARCH_HOST: 'http://127.0.0.1:7700',
  }

  for (const [key, value] of Object.entries(defaults)) {
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

async function generateOpenApi(): Promise<void> {
  let app: NestExpressApplication | null = null

  try {
    setupOpenApiEnv()
    const { AppModule } = await import('../app.module')

    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      abortOnError: false,
      logger: false,
    })

    setupSwagger(app)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.warn(`OpenAPI generation skipped: ${errorMessage}`)
  } finally {
    if (app) {
      await app.close()
    }
  }
}

void generateOpenApi()
