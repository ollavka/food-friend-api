import { Provider } from '@nestjs/common'
import { getConfigToken, registerAs } from '@nestjs/config'
import OpenAI from 'openai'
import { OPEN_AI_CLIENT_TOKEN, OPEN_AI_ENV_CONFIG_KEY } from './constant'
import { OpenAiEnvConfig } from './type'

export const openAiEnvConfig: () => OpenAiEnvConfig = registerAs(OPEN_AI_ENV_CONFIG_KEY, () => ({
  apiKey: process.env.OPENAI_API_KEY,
  baseUrl: process.env.OPENAI_BASE_URL,
  textModel: process.env.OPENAI_TEXT_MODEL,
  visionModel: process.env.OPENAI_VISION_MODEL,
  imageModel: process.env.OPENAI_IMAGE_MODEL,
  timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS),
  maxRetries: Number(process.env.OPENAI_MAX_RETRIES),
}))

function getOpenAiClientFactory(config: OpenAiEnvConfig): OpenAI {
  const { apiKey, baseUrl, timeoutMs, maxRetries } = config

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing')
  }

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('OPENAI_TIMEOUT_MS must be a positive integer')
  }

  if (!Number.isFinite(maxRetries) || maxRetries < 0) {
    throw new Error('OPENAI_MAX_RETRIES must be zero or a positive integer')
  }

  return new OpenAI({
    apiKey,
    ...(baseUrl ? { baseURL: baseUrl } : {}),
    timeout: timeoutMs,
    maxRetries,
  })
}

export const openAiModuleProviders: Provider[] = [
  {
    provide: OPEN_AI_CLIENT_TOKEN,
    useFactory: getOpenAiClientFactory,
    inject: [getConfigToken(OPEN_AI_ENV_CONFIG_KEY)],
  },
]
