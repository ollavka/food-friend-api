import { Global, Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'
import { mailModuleConfig } from './config/mail.config'
import { MailService } from './service'

@Global()
@Module({
  imports: [MailerModule.forRootAsync(mailModuleConfig)],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
