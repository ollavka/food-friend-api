import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common'
import { OtpCodeType, UserStatus } from '@prisma/client'
import { Response } from 'express'
import { AppEntityNotFoundException } from '@common/exception'
import { AccessTokenApiModel } from '@core/auth/api-model'
import { UserService } from '@core/user'
import { MailService } from '@infrastructure/mail'
import { OtpService } from '@infrastructure/otp'
import { AuthService } from '../../service'
import { OtpTicketApiModel } from '../api-model'
import { ConfirmEmailDto } from '../dto'

@Injectable()
export class EmailVerificationService {
  public constructor(
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
  ) {}

  public test(): string {
    return 'test'
  }

  public async sendVerificationMail(email: string, checkUser = true): Promise<OtpTicketApiModel> {
    if (checkUser) {
      const user = await this.userService.findByEmail(email)

      if (user && user.status !== UserStatus.UNVERIFIED) {
        throw new BadRequestException('You have already confirmed your email address.')
      }
    }

    const otpCode = this.otpService.generateCode()
    const hashedCode = this.otpService.hashCode(otpCode, { scope: OtpCodeType.EMAIL_VERIFICATION, identity: email })
    await this.mailService.sendVerificationEmailMail(otpCode)
    const otpEntity = await this.otpService.saveCode(hashedCode, email, OtpCodeType.EMAIL_VERIFICATION)
    return OtpTicketApiModel.from(otpEntity)
  }

  public async confirmEmail(
    res: Response,
    { ticket, code }: ConfirmEmailDto,
    makeAuth?: boolean,
  ): Promise<AccessTokenApiModel | boolean> {
    const userEmail = await this.otpService.confirmCode(ticket, code, OtpCodeType.EMAIL_VERIFICATION)

    try {
      const userEntity = await this.userService.updateStatus({ email: userEmail }, UserStatus.ACTIVE)
      return makeAuth ? this.authService.auth(res, userEntity) : true
    } catch (_err) {
      throw new AppEntityNotFoundException('User', { email: userEmail })
    }
  }
}
