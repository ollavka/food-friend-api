import { describe, expect, it } from '@jest/globals'
import { redisEnvConfig } from './redis.config'

describe('redisEnvConfig', () => {
  const setEnvVar = (key: string, value: string | undefined): void => {
    Object.defineProperty(process.env, key, {
      value,
      configurable: true,
    })
  }

  it('should map redis env vars with numeric casting', () => {
    setEnvVar('REDIS_HOST', '127.0.0.1')
    setEnvVar('REDIS_PORT', '6379')
    setEnvVar('REDIS_PASSWORD', 'secret')
    setEnvVar('REDIS_DB', '2')

    const config = redisEnvConfig()

    expect(config).toEqual({
      host: '127.0.0.1',
      port: 6379,
      password: 'secret',
      db: 2,
    })
  })

  it('should keep redis db undefined when env is missing', () => {
    setEnvVar('REDIS_DB', undefined)

    const config = redisEnvConfig()

    expect(config.db).toBeUndefined()
  })
})
