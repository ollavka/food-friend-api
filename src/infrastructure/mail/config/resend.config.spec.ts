import { describe, expect, it } from '@jest/globals'
import { Resend } from 'resend'
import { RESEND_CLIENT_TOKEN, RESEND_FROM_TOKEN, RESEND_TO_EMAIL_TOKEN } from './constant'
import { resendEnvConfig, resendModuleProviders } from './resend.config'

describe('resend config', () => {
  const setEnvVar = (key: string, value: string): void => {
    Object.defineProperty(process.env, key, {
      value,
      configurable: true,
    })
  }

  const findFactory = (token: symbol): ((config: any) => any) => {
    const provider = resendModuleProviders.find((item) => (item as any).provide === token) as any
    return provider.useFactory as (config: any) => any
  }

  it('should map resend env config values', () => {
    setEnvVar('RESEND_API_KEY', 're_test')
    setEnvVar('RESEND_FROM_EMAIL', 'noreply@example.com')
    setEnvVar('RESEND_TO_EMAIL', 'dev@example.com')
    setEnvVar('RESEND_FROM_NAME', 'Food Friend')

    const config = resendEnvConfig()

    expect(config).toEqual({
      resendApiKey: 're_test',
      resendFromEmail: 'noreply@example.com',
      resendToEmail: 'dev@example.com',
      resendFromName: 'Food Friend',
    })
  })

  it('should build resend providers outputs', () => {
    const clientFactory = findFactory(RESEND_CLIENT_TOKEN)
    const fromFactory = findFactory(RESEND_FROM_TOKEN)
    const toFactory = findFactory(RESEND_TO_EMAIL_TOKEN)

    const config = {
      resendApiKey: 're_test',
      resendFromEmail: 'noreply@example.com',
      resendToEmail: 'dev@example.com',
      resendFromName: 'Food Friend',
    }

    const client = clientFactory(config)
    const from = fromFactory(config)
    const toEmail = toFactory(config)

    expect(client).toBeInstanceOf(Resend)
    expect(from).toBe('Food Friend <noreply@example.com>')
    expect(toEmail).toBe('dev@example.com')
  })

  it('should throw for missing required resend config values', () => {
    const clientFactory = findFactory(RESEND_CLIENT_TOKEN)
    const fromFactory = findFactory(RESEND_FROM_TOKEN)
    const toFactory = findFactory(RESEND_TO_EMAIL_TOKEN)

    expect(() => clientFactory({ resendApiKey: '' })).toThrow('RESEND_API_KEY is missing')
    expect(() => fromFactory({ resendFromEmail: '', resendFromName: '' })).toThrow(
      'RESEND_FROM_EMAIL or RESEND_FROM_NAME is missing',
    )
    expect(() => toFactory({ resendToEmail: '' })).toThrow('RESEND_TO_EMAIL is missing')
  })
})
