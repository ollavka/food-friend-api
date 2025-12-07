import { Provider } from '@nestjs/common'
import { getConfigToken, registerAs } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'
import { GOOGLE_AUTH_CLIENT_TOKEN, GOOGLE_CLIENT_ID_TOKEN, GOOGLE_CLIENT_SECRET_TOKEN } from '../constant'
import { GOOGLE_PROVIDER_ENV_CONFIG_KEY } from './constant'
import { GoogleProviderEnvConfig } from './type'

export const googleProviderEnvConfig: () => GoogleProviderEnvConfig = registerAs(
  GOOGLE_PROVIDER_ENV_CONFIG_KEY,
  () => ({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
)

function getGoogleClientIdFactory(config: GoogleProviderEnvConfig): string {
  if (!config.clientId) {
    throw new Error('GOOGLE_CLIENT_ID is missing')
  }

  return config.clientId
}

function getGoogleClientSecretFactory(config: GoogleProviderEnvConfig): string | null {
  return config?.clientSecret ?? null
}

function getGoogleOauthClientFactory(config: GoogleProviderEnvConfig): OAuth2Client {
  if (!config.clientId) {
    throw new Error('GOOGLE_CLIENT_ID is missing')
  }

  return new OAuth2Client(config.clientId)
}

export const googleProviderModuleProviders: Provider[] = [
  {
    provide: GOOGLE_CLIENT_ID_TOKEN,
    useFactory: getGoogleClientIdFactory,
    inject: [getConfigToken(GOOGLE_PROVIDER_ENV_CONFIG_KEY)],
  },
  {
    provide: GOOGLE_CLIENT_SECRET_TOKEN,
    useFactory: getGoogleClientSecretFactory,
    inject: [getConfigToken(GOOGLE_PROVIDER_ENV_CONFIG_KEY)],
  },
  {
    provide: GOOGLE_AUTH_CLIENT_TOKEN,
    useFactory: getGoogleOauthClientFactory,
    inject: [getConfigToken(GOOGLE_PROVIDER_ENV_CONFIG_KEY)],
  },
]
