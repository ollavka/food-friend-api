import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { render } from '@react-email/render'
import { addMinutes, differenceInSeconds, isAfter, isEqual } from 'date-fns'
import { MAIL_RESEND_WINDOW_MINS } from '@common/constant'
import { Exception } from '@common/exception'
import { Nullable } from '@common/type'
import { LocalizationFactory } from '@localization'
import { ResetPasswordMailTemplate, VerificationEmailMailTemplate, WelcomeMailTemplate } from '../template'

@Injectable()
export class MailService {
  public constructor(
    private readonly mailerService: MailerService,
    private readonly localizationFactory: LocalizationFactory,
  ) {}

  public async sendWelcomeMail(toEmail: string, userName: Nullable<string>): Promise<void> {
    try {
      const t = this.localizationFactory.createFor('email.welcome', { parseHtml: true })
      const html = await render(WelcomeMailTemplate({ userName, t }))

      await this.mailerService.sendMail({
        to: 'lavka.alexey37@gmail.com',
        // to: toEmail,
        subject: t('subject', { parseHtml: false }),
        html,
      })
    } catch {
      throw new InternalServerErrorException('The welcome mail could not be sent.')
    }
  }

  public async sendVerificationEmailMail(code: string, toEmail: string, userName: Nullable<string>): Promise<void> {
    try {
      const t = this.localizationFactory.createFor('email.verification', { parseHtml: true })
      const html = await render(VerificationEmailMailTemplate({ code, userName, t }))

      await this.mailerService.sendMail({
        to: 'lavka.alexey37@gmail.com',
        // to: toEmail,
        subject: t('subject', { parseHtml: false }),
        html,
      })
    } catch {
      throw new InternalServerErrorException('The confirmation email mail could not be sent.')
    }
  }

  public async sendResetPasswordMail(code: string, toEmail: string, userName: Nullable<string>): Promise<void> {
    try {
      const t = this.localizationFactory.createFor('email.password.reset', { parseHtml: true })
      const html = await render(ResetPasswordMailTemplate({ code, userName, t }))

      await this.mailerService.sendMail({
        to: 'lavka.alexey37@gmail.com',
        // to: toEmail,
        subject: t('subject', { parseHtml: false }),
        html,
      })
    } catch (err) {
      const reason = err?.message ?? null
      throw new Exception('The reset password mail could not be sent.', {
        details: reason ? { reason } : null,
      }).internal()
    }
  }

  public canSendMailAfterSeconds(lastSentMailAt: Date | null): number {
    if (!lastSentMailAt) {
      return 0
    }

    const now = new Date()
    const nextAllowedAt = addMinutes(lastSentMailAt, MAIL_RESEND_WINDOW_MINS)

    if (isAfter(now, nextAllowedAt) || isEqual(now, nextAllowedAt)) {
      return 0
    }

    const secondsLeft = differenceInSeconds(nextAllowedAt, now)
    return Math.max(0, secondsLeft)
  }
}
