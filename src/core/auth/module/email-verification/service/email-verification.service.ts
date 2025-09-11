import { BadRequestException, Injectable } from '@nestjs/common'
import { OtpCodeStatus, OtpCodeType, UserStatus } from '@prisma/client'
import { Response } from 'express'
import { StatusPolicy } from '@access-control/util'
import { ConfirmOtpCodeDto } from '@common/dto'
import { AppEntityNotFoundException, AppRateLimitException } from '@common/exception'
import { UserService } from '@core/user'
import { PrismaService } from '@infrastructure/database'
import { MailService } from '@infrastructure/mail'
import { OtpService } from '@infrastructure/otp'
import { AccessTokenApiModel, OtpTicketApiModel } from '../../../api-model'
import { AuthSessionService } from '../../auth-session'

@Injectable()
export class EmailVerificationService {
  public constructor(
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  public async sendVerificationMail(email: string, checkUser = true): Promise<OtpTicketApiModel> {
    const user = await this.userService.findByEmail(email)

    if (!user) {
      throw new AppEntityNotFoundException('User', { email })
    }

    if (checkUser && user.status !== UserStatus.UNVERIFIED) {
      const isActiveUserStatus = await StatusPolicy.enforce(user)

      if (isActiveUserStatus) {
        throw new BadRequestException('You have already confirmed your email address.')
      }
    }

    const retryAfterSec = this.mailService.canSendMailAfterSeconds(user.lastEmailVerificationMailSentAt)

    if (retryAfterSec > 0) {
      throw new AppRateLimitException('mail', {
        secondsLeft: retryAfterSec,
      })
    }

    const otpCode = this.otpService.generateCode()
    const hashedCode = this.otpService.hashCode(otpCode, { scope: OtpCodeType.EMAIL_VERIFICATION, identity: email })
    await this.mailService.sendVerificationEmailMail(otpCode, email, user.firstName)
    await this.userService.update(user.id, {
      lastEmailVerificationMailSentAt: new Date(),
    })
    const otpEntity = await this.otpService.saveCode(hashedCode, user, OtpCodeType.EMAIL_VERIFICATION)
    return OtpTicketApiModel.from(otpEntity)
  }

  public async confirmEmail(
    res: Response,
    { ticket, code }: ConfirmOtpCodeDto,
    makeAuth?: boolean,
  ): Promise<AccessTokenApiModel | null> {
    const { email: userEmail } = await this.otpService.confirmCode(ticket, code, OtpCodeType.EMAIL_VERIFICATION)

    const userEntity = await this.prismaService.$transaction(async (tx) => {
      const otpCode = await this.otpService.findById(ticket, tx)
      this.otpService.validateStatus(otpCode, OtpCodeStatus.CONSUMED)

      const user = await this.userService.findByEmail(userEmail, {}, tx)

      if (!user) {
        throw new AppEntityNotFoundException('User', { email: userEmail })
      }

      await StatusPolicy.enforce(user)

      await this.otpService.update(ticket, { status: OtpCodeStatus.USED }, tx)

      if (user.status === UserStatus.UNVERIFIED) {
        return this.userService.update(user.id, { status: UserStatus.ACTIVE }, tx)
      }

      return user
    })

    return makeAuth ? this.authSessionService.auth(res, userEntity) : null
  }
}
