import { describe, expect, it } from '@jest/globals'
import { OAuth2Client } from 'google-auth-library'
import { GOOGLE_AUTH_CLIENT_TOKEN, GOOGLE_CLIENT_ID_TOKEN, GOOGLE_CLIENT_SECRET_TOKEN } from '../constant'
import { googleProviderEnvConfig, googleProviderModuleProviders } from './google-provider.config'

describe('googleProviderEnvConfig', () => {
  const setEnvVar = (key: string, value: string | undefined): void => {
    Object.defineProperty(process.env, key, {
      value,
      configurable: true,
    })
  }

  it('should map google provider env vars', () => {
    setEnvVar('GOOGLE_CLIENT_ID', 'google-client-id')
    setEnvVar('GOOGLE_CLIENT_SECRET', 'google-client-secret')

    expect(googleProviderEnvConfig()).toEqual({
      clientId: 'google-client-id',
      clientSecret: 'google-client-secret',
    })
  })
})

describe('googleProviderModuleProviders', () => {
  const getProvider = (token: symbol): any =>
    (googleProviderModuleProviders as Array<{ provide: unknown }>).find((provider) => provider.provide === token)

  it('should expose client id, client secret and oauth client factories', () => {
    const config = {
      clientId: 'google-client-id',
      clientSecret: 'google-client-secret',
    }

    const clientIdProvider = getProvider(GOOGLE_CLIENT_ID_TOKEN)
    const clientSecretProvider = getProvider(GOOGLE_CLIENT_SECRET_TOKEN)
    const oauthProvider = getProvider(GOOGLE_AUTH_CLIENT_TOKEN)

    expect(clientIdProvider.useFactory(config)).toBe('google-client-id')
    expect(clientSecretProvider.useFactory(config)).toBe('google-client-secret')
    expect(oauthProvider.useFactory(config)).toBeInstanceOf(OAuth2Client)
  })

  it('should allow empty client secret and throw when client id is missing', () => {
    const clientIdProvider = getProvider(GOOGLE_CLIENT_ID_TOKEN)
    const clientSecretProvider = getProvider(GOOGLE_CLIENT_SECRET_TOKEN)
    const oauthProvider = getProvider(GOOGLE_AUTH_CLIENT_TOKEN)

    expect(clientSecretProvider.useFactory({ clientId: 'id', clientSecret: undefined })).toBeNull()
    expect(() => clientIdProvider.useFactory({ clientId: undefined })).toThrow('GOOGLE_CLIENT_ID is missing')
    expect(() => oauthProvider.useFactory({ clientId: undefined })).toThrow('GOOGLE_CLIENT_ID is missing')
  })
})
