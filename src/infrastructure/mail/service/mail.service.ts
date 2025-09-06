import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { render } from '@react-email/render'
import { Exception } from '@common/exception'
import { LocalizationFactory } from '@localization'
import { EmailVerificationTemplate, EmailWelcomeTemplate } from '../template'

@Injectable()
export class MailService {
  public constructor(
    private readonly mailerService: MailerService,
    private readonly localizationFactory: LocalizationFactory,
  ) {}

  public async sendWelcomeMail(toEmail: string, userName?: string): Promise<void> {
    try {
      const t = this.localizationFactory.createFor('email.welcome', { parseHtml: true })
      const html = await render(EmailWelcomeTemplate({ userName, t }))

      await this.mailerService.sendMail({
        to: 'lavka.alexey37@gmail.com',
        // to: toEmail,
        subject: t('subject', { parseHtml: false }),
        html,
      })
    } catch (err) {
      const reason = err?.message ?? null
      throw new Exception('The welcome email could not be sent.', { details: reason ? { reason } : null })
    }
  }

  public async sendVerificationEmailMail(code: string, toEmail: string, userName?: string): Promise<void> {
    try {
      const t = this.localizationFactory.createFor('email.verification', { parseHtml: true })
      const html = await render(EmailVerificationTemplate({ code, userName, t }))

      await this.mailerService.sendMail({
        to: 'lavka.alexey37@gmail.com',
        // to: toEmail,
        subject: t('subject', { parseHtml: false }),
        html,
      })
    } catch (err) {
      const reason = err?.message ?? null
      throw new Exception('The confirmation email could not be sent.', { details: reason ? { reason } : null })
    }
  }
}
