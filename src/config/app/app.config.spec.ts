import { describe, expect, it } from '@jest/globals'
import { Environment } from '@common/enum'
import { appEnvConfig } from './app.config'

describe('appEnvConfig', () => {
  const setEnvVar = (key: string, value: string | undefined): void => {
    Object.defineProperty(process.env, key, {
      value,
      configurable: true,
    })
  }

  it('should map app env vars and normalize arrays/log levels', () => {
    setEnvVar('APP_PORT', '3000')
    setEnvVar('APP_HOST', '0.0.0.0')
    setEnvVar('NODE_ENV', Environment.Development)
    setEnvVar('ALLOWED_ORIGINS', ' https://a.local ,https://b.local ')
    setEnvVar('HASH_PEPPER', 'pepper')
    setEnvVar('LOG_ERROR', 'true')
    setEnvVar('LOG_WARNING', 'false')
    setEnvVar('LOG_INFO', 'true')
    setEnvVar('LOG_DEBUG', 'false')
    setEnvVar('LOG_VERBOSE', 'true')

    const config = appEnvConfig()

    expect(config).toEqual({
      port: '3000',
      host: '0.0.0.0',
      nodeEnv: Environment.Development,
      allowedOrigins: ['https://a.local', 'https://b.local'],
      hashPepper: 'pepper',
      logLevels: ['error', 'log', 'verbose'],
    })
  })
})
