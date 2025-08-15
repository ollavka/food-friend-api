import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { render } from '@react-email/components'
import { Exception } from '@common/exception'
import { Email } from '../template'

@Injectable()
export class MailService {
  public constructor(private readonly mailerService: MailerService) {}

  public async sendVerificationEmailMail(code: string): Promise<any> {
    try {
      const html = await render(Email({ code }))

      await this.mailerService.sendMail({
        to: 'lavka.alexey37@gmail.com',
        from: 'lavka.alexey37@gmail.com',
        subject: 'Testing Nest MailerModule ✔',
        text: 'welcome',
        html,
      })
    } catch (err) {
      const reason = err?.message ?? null
      throw new Exception('The confirmation email could not be sent.', { details: reason ? { reason } : null })
    }
  }
}
