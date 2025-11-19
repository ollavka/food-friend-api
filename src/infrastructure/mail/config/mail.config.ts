import { ConfigModule, ConfigType, getConfigToken, registerAs } from '@nestjs/config'
import { MailerOptions } from '@nestjs-modules/mailer'
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface'
import { isDev } from '@common/util'
import { MAIL_ENV_CONFIG_KEY } from './constant'
import { MailEnvConfig } from './type'

export const mailEnvConfig: () => MailEnvConfig = registerAs(MAIL_ENV_CONFIG_KEY, () => ({
  mailSmtpHost: process.env.MAIL_SMTP_HOST,
  mailSmtpPort: +process.env.MAIL_SMTP_PORT,
  mailSmtpEmail: process.env.MAIL_SMTP_EMAIL,
  mailSmtpPassword: process.env.MAIL_SMTP_PASSWORD,
}))

function getMailConfigFactory(config: ConfigType<typeof mailEnvConfig>): MailerOptions {
  const isDevEnv = isDev()

  return {
    transport: {
      host: config.mailSmtpHost,
      port: config.mailSmtpPort,
      secure: !isDevEnv,
      auth: {
        user: config.mailSmtpEmail,
        pass: config.mailSmtpPassword,
      },
      debug: isDevEnv,
      logger: true,
    },
  }
}

export const mailModuleConfig: MailerAsyncOptions = {
  imports: [ConfigModule.forFeature(mailEnvConfig)],
  useFactory: getMailConfigFactory,
  inject: [getConfigToken(MAIL_ENV_CONFIG_KEY)],
}
