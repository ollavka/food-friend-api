import { Inject, Injectable } from '@nestjs/common'
import { render } from '@react-email/render'
import { addMinutes, differenceInSeconds, isAfter, isEqual } from 'date-fns'
import { Resend } from 'resend'
import { MAIL_RESEND_WINDOW_MINS } from '@common/constant'
import { AppInternalException } from '@common/exception'
import { Nullable } from '@common/type'
import { LocalizationFactory } from '@localization'
import { RESEND_CLIENT_TOKEN, RESEND_FROM_TOKEN } from '../config'
import { ResetPasswordMailTemplate, VerificationEmailMailTemplate } from '../template'
import { SendMailParams } from '../type'

@Injectable()
export class MailService {
  public constructor(
    @Inject(RESEND_CLIENT_TOKEN) private readonly resend: Resend,
    @Inject(RESEND_FROM_TOKEN) private readonly resendFrom: string,
    // private readonly mailerService: MailerService,
    private readonly localizationFactory: LocalizationFactory,
  ) {}

  private async sendMail({ to, from = '', ...restSendMailParams }: SendMailParams): Promise<void> {
    // await this.mailerService.sendMail(sendMailParams)
    const isDevMail = from.includes('resend.dev')

    await this.resend.emails.send({
      ...restSendMailParams,
      from,
      // we can send dev mails only to own account for testing (need to buy domain for general usage)
      to: isDevMail ? 'oleksii.lavka.dev@gmail.com' : to,
    })
  }

  public async sendWelcomeMail(_toEmail: string, _userName: Nullable<string>): Promise<void> {
    try {
      // const t = this.localizationFactory.createFor('email.welcome', { parseHtml: true })
      // const html = await render(WelcomeMailTemplate({ userName, t }))
      // await this.sendMail({
      //   from: this.resendFrom,
      //   to: toEmail,
      //   subject: t('subject', { parseHtml: false }),
      //   html,
      // })
    } catch (_err) {
      throw new AppInternalException('mail.welcome-send', 'The welcome mail could not be sent.')
    }
  }

  public async sendVerificationEmailMail(code: string, toEmail: string, userName: Nullable<string>): Promise<void> {
    try {
      const t = this.localizationFactory.createFor('email.verification', { parseHtml: true })
      const html = await render(VerificationEmailMailTemplate({ code, userName, t }))

      await this.sendMail({
        from: this.resendFrom,
        to: toEmail,
        subject: t('subject', { parseHtml: false }),
        html,
      })
    } catch (_err) {
      throw new AppInternalException('mail.verification-send', 'The confirmation email mail could not be sent.')
    }
  }

  public async sendResetPasswordMail(code: string, toEmail: string, userName: Nullable<string>): Promise<void> {
    try {
      const t = this.localizationFactory.createFor('email.password.reset', { parseHtml: true })
      const html = await render(ResetPasswordMailTemplate({ code, userName, t }))

      await this.sendMail({
        from: this.resendFrom,
        to: toEmail,
        subject: t('subject', { parseHtml: false }),
        html,
      })
    } catch (_err) {
      throw new AppInternalException('mail.reset-send', 'The reset password mail could not be sent.')
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
