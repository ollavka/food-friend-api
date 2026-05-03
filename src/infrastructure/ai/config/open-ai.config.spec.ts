import { describe, expect, it } from '@jest/globals'
import OpenAI from 'openai'
import { OPEN_AI_CLIENT_TOKEN } from './constant'
import { openAiEnvConfig, openAiModuleProviders } from './open-ai.config'

describe('openAiEnvConfig', () => {
  const setEnvVar = (key: string, value: string | undefined): void => {
    Object.defineProperty(process.env, key, {
      value,
      configurable: true,
    })
  }

  it('should map openai env vars with number casting', () => {
    setEnvVar('OPENAI_API_KEY', 'openai-key')
    setEnvVar('OPENAI_BASE_URL', 'https://api.openai.local')
    setEnvVar('OPENAI_TEXT_MODEL', 'gpt-4.1-mini')
    setEnvVar('OPENAI_VISION_MODEL', 'gpt-4.1-mini')
    setEnvVar('OPENAI_IMAGE_MODEL', 'gpt-image-1')
    setEnvVar('OPENAI_TIMEOUT_MS', '30000')
    setEnvVar('OPENAI_MAX_RETRIES', '2')

    const config = openAiEnvConfig()

    expect(config).toEqual({
      apiKey: 'openai-key',
      baseUrl: 'https://api.openai.local',
      textModel: 'gpt-4.1-mini',
      visionModel: 'gpt-4.1-mini',
      imageModel: 'gpt-image-1',
      timeoutMs: 30000,
      maxRetries: 2,
    })
  })
})

describe('openAiModuleProviders', () => {
  const provider = (openAiModuleProviders as Array<{ provide: unknown }>).find(
    (item) => item.provide === OPEN_AI_CLIENT_TOKEN,
  ) as any

  it('should create openai client from valid config', () => {
    const client = provider.useFactory({
      apiKey: 'openai-key',
      baseUrl: 'https://api.openai.local',
      timeoutMs: 10000,
      maxRetries: 1,
    })

    expect(client).toBeInstanceOf(OpenAI)
  })

  it('should throw when api key is missing', () => {
    expect(() =>
      provider.useFactory({
        apiKey: '',
        timeoutMs: 10000,
        maxRetries: 1,
      }),
    ).toThrow('OPENAI_API_KEY is missing')
  })

  it('should throw when timeout is invalid', () => {
    expect(() =>
      provider.useFactory({
        apiKey: 'openai-key',
        timeoutMs: 0,
        maxRetries: 1,
      }),
    ).toThrow('OPENAI_TIMEOUT_MS must be a positive integer')
  })

  it('should throw when max retries is invalid', () => {
    expect(() =>
      provider.useFactory({
        apiKey: 'openai-key',
        timeoutMs: 10000,
        maxRetries: -1,
      }),
    ).toThrow('OPENAI_MAX_RETRIES must be zero or a positive integer')
  })
})
