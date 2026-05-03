import { describe, expect, it } from '@jest/globals'
import { getConfigToken } from '@nestjs/config'
import { JWT_ENV_CONFIG_KEY } from './constant'
import { jwtEnvConfig, jwtModuleConfig } from './jwt.config'

describe('jwtEnvConfig', () => {
  const setEnvVar = (key: string, value: string | undefined): void => {
    Object.defineProperty(process.env, key, {
      value,
      configurable: true,
    })
  }

  it('should map jwt env vars', () => {
    setEnvVar('JWT_SECRET_KEY', 'jwt-secret')
    setEnvVar('JWT_ACCESS_TOKEN_TTL', '1h')
    setEnvVar('JWT_REFRESH_TOKEN_TTL', '7d')

    expect(jwtEnvConfig()).toEqual({
      jwtSecretKey: 'jwt-secret',
      jwtAccessTokenTtl: '1h',
      jwtRefreshTokenTtl: '7d',
    })
  })
})

describe('jwtModuleConfig', () => {
  it('should build jwt module options from config', () => {
    const options = (jwtModuleConfig.useFactory as any)({
      jwtSecretKey: 'jwt-secret',
    })

    expect(options).toEqual({
      secret: 'jwt-secret',
      signOptions: { algorithm: 'HS256' },
      verifyOptions: {
        algorithms: ['HS256'],
        ignoreExpiration: false,
      },
    })
    expect(jwtModuleConfig.inject).toEqual([getConfigToken(JWT_ENV_CONFIG_KEY)])
  })
})
