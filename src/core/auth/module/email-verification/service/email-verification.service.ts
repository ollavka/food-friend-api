import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common'
import { OtpCodeType, UserStatus } from '@prisma/client'
import { Response } from 'express'
import { StatusPolicy } from '@access-control/util'
import { ConfirmOtpCodeDto } from '@common/dto'
import { AppEntityNotFoundException, AppRateLimitException } from '@common/exception'
import { AccessTokenApiModel, OtpTicketApiModel } from '@core/auth/api-model'
import { AuthService } from '@core/auth/service'
import { UserService } from '@core/user'
import { PrismaService } from '@infrastructure/database'
import { MailService } from '@infrastructure/mail'
import { OtpService } from '@infrastructure/otp'

@Injectable()
export class EmailVerificationService {
  public constructor(
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
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
      throw new AppRateLimitException(
        'mail',
        `You have exceeded the rate limit. Please try again in ${retryAfterSec} seconds.`,
        {
          secondsLeft: retryAfterSec,
        },
      )
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
    const userEntity = await this.prismaService.$transaction(async (tx) => {
      const userEmail = await this.otpService.confirmCode(ticket, code, OtpCodeType.EMAIL_VERIFICATION, tx)
      const user = await this.userService.findByEmail(userEmail, {}, tx)

      if (!user) {
        throw new AppEntityNotFoundException('User', { email: userEmail })
      }

      const isActiveUserStatus = await StatusPolicy.enforce(user)

      if (isActiveUserStatus) {
        return this.userService.update(user.id, { status: UserStatus.ACTIVE }, tx)
      }

      return user
    })

    return makeAuth ? this.authService.auth(res, userEntity) : null
  }
}
