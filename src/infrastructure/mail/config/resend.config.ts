import { Provider } from '@nestjs/common'
import { getConfigToken, registerAs } from '@nestjs/config'
import { Resend } from 'resend'
import { RESEND_CLIENT_TOKEN, RESEND_ENV_CONFIG_KEY, RESEND_FROM_TOKEN, RESEND_TO_EMAIL_TOKEN } from './constant'
import { ResendEnvConfig } from './type'

export const resendEnvConfig: () => ResendEnvConfig = registerAs(RESEND_ENV_CONFIG_KEY, () => ({
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,
  resendToEmail: process.env.RESEND_TO_EMAIL,
  resendFromName: process.env.RESEND_FROM_NAME,
}))

function getResendClientFactory(config: ResendEnvConfig): Resend {
  const { resendApiKey } = config

  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is missing')
  }

  const resend = new Resend(resendApiKey)
  return resend
}

function getResendFromFactory(config: ResendEnvConfig): string {
  const { resendFromEmail, resendFromName } = config

  if (!resendFromEmail || !resendFromName) {
    throw new Error('RESEND_FROM_EMAIL or RESEND_FROM_NAME is missing')
  }

  return `${resendFromName} <${resendFromEmail}>`
}

function getResendToEmailFactory(config: ResendEnvConfig): string {
  const { resendToEmail } = config

  if (!resendToEmail) {
    throw new Error('RESEND_TO_EMAIL is missing')
  }

  return resendToEmail
}

export const resendModuleProviders: Provider[] = [
  {
    provide: RESEND_CLIENT_TOKEN,
    useFactory: getResendClientFactory,
    inject: [getConfigToken(RESEND_ENV_CONFIG_KEY)],
  },
  {
    provide: RESEND_FROM_TOKEN,
    useFactory: getResendFromFactory,
    inject: [getConfigToken(RESEND_ENV_CONFIG_KEY)],
  },
  {
    provide: RESEND_TO_EMAIL_TOKEN,
    useFactory: getResendToEmailFactory,
    inject: [getConfigToken(RESEND_ENV_CONFIG_KEY)],
  },
]
