import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'

const flushAsync = async (): Promise<void> => {
  await new Promise((resolve) => setImmediate(resolve))
  await new Promise((resolve) => setImmediate(resolve))
}

describe('generate-openapi script', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      OPENAPI_GENERATE: '',
      REDIS_HOST: '',
      REDIS_PORT: '',
      OPENAI_API_KEY: '',
      OPENAI_TEXT_MODEL: '',
      OPENAI_TIMEOUT_MS: '',
      OPENAI_MAX_RETRIES: '',
      MEILISEARCH_HOST: '',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should set defaults, bootstrap app, setup swagger and close app', async () => {
    const appCloseMock = jest.fn(() => Promise.resolve())
    const appMock = { close: appCloseMock }
    const createMock = jest.fn(() => Promise.resolve(appMock))
    const setupSwaggerMock = jest.fn()
    const AppModule = class AppModule {}

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: createMock,
      },
    }))
    jest.doMock('@config/swagger', () => ({
      setupSwagger: setupSwaggerMock,
    }))
    jest.doMock('../app.module', () => ({ AppModule }))

    await import('./generate-openapi.script')
    await flushAsync()

    expect(process.env.OPENAPI_GENERATE).toBe('true')
    expect(process.env.REDIS_HOST).toBe('127.0.0.1')
    expect(process.env.REDIS_PORT).toBe('6379')
    expect(process.env.OPENAI_API_KEY).toBe('openapi-docs-dummy-key')
    expect(process.env.OPENAI_TEXT_MODEL).toBe('gpt-4.1-mini')
    expect(process.env.OPENAI_TIMEOUT_MS).toBe('30000')
    expect(process.env.OPENAI_MAX_RETRIES).toBe('2')
    expect(process.env.MEILISEARCH_HOST).toBe('http://127.0.0.1:7700')

    expect(createMock).toHaveBeenCalledWith(AppModule, {
      abortOnError: false,
      logger: false,
    })
    expect(setupSwaggerMock).toHaveBeenCalledWith(appMock)
    expect(appCloseMock).toHaveBeenCalledTimes(1)
  })

  it('should warn and continue when openapi bootstrapping fails', async () => {
    const createMock = jest.fn(() => Promise.reject(new Error('bootstrap failed')))
    const setupSwaggerMock = jest.fn()
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    const AppModule = class AppModule {}

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: createMock,
      },
    }))
    jest.doMock('@config/swagger', () => ({
      setupSwagger: setupSwaggerMock,
    }))
    jest.doMock('../app.module', () => ({ AppModule }))

    await import('./generate-openapi.script')
    await flushAsync()

    expect(createMock).toHaveBeenCalledTimes(1)
    expect(setupSwaggerMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith('OpenAPI generation skipped: bootstrap failed')
  })
})
