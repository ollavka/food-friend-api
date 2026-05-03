import { describe, expect, it } from '@jest/globals'
import { mailEnvConfig, mailModuleConfig } from './mail.config'

describe('mail config', () => {
  const setNodeEnv = (value: string): void => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value,
      configurable: true,
    })
  }

  const setEnvVar = (key: string, value: string): void => {
    Object.defineProperty(process.env, key, {
      value,
      configurable: true,
    })
  }

  it('should map env config values', () => {
    setEnvVar('MAIL_SMTP_HOST', 'smtp.example.com')
    setEnvVar('MAIL_SMTP_PORT', '465')
    setEnvVar('MAIL_SMTP_EMAIL', 'user@example.com')
    setEnvVar('MAIL_SMTP_PASSWORD', 'secret')

    const config = mailEnvConfig()

    expect(config).toEqual({
      mailSmtpHost: 'smtp.example.com',
      mailSmtpPort: 465,
      mailSmtpEmail: 'user@example.com',
      mailSmtpPassword: 'secret',
    })
  })

  it('should build transport config for development and production', () => {
    const useFactory = (mailModuleConfig as any).useFactory as (config: any) => any

    setNodeEnv('development')
    const devConfig = useFactory({
      mailSmtpHost: 'smtp.dev',
      mailSmtpPort: 2525,
      mailSmtpEmail: 'dev@example.com',
      mailSmtpPassword: 'secret',
    })

    expect(devConfig.transport.secure).toBe(false)
    expect(devConfig.transport.debug).toBe(true)

    setNodeEnv('production')
    const prodConfig = useFactory({
      mailSmtpHost: 'smtp.prod',
      mailSmtpPort: 465,
      mailSmtpEmail: 'prod@example.com',
      mailSmtpPassword: 'secret',
    })

    expect(prodConfig.transport.secure).toBe(true)
    expect(prodConfig.transport.debug).toBe(false)
  })
})
