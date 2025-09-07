import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { OtpCodeType, User, UserStatus } from '@prisma/client'
import { StatusPolicy } from '@access-control/util'
import { ConfirmOtpCodeDto } from '@common/dto'
import { AppEntityNotFoundException, AppRateLimitException } from '@common/exception'
import { Uuid } from '@common/type'
import { OtpTicketApiModel } from '@core/auth/api-model'
import { UserService } from '@core/user'
import { BcryptService } from '@infrastructure/cryptography'
import { PrismaService } from '@infrastructure/database'
import { MailService } from '@infrastructure/mail'
import { OtpService } from '@infrastructure/otp'
import { ResetPasswordSessionApiModel } from '../api-model'
import { ChangePasswordDto, ResetPasswordCompleteDto } from '../dto'
import { ResetPasswordSessionRepository } from '../repository'

@Injectable()
export class PasswordManagementService {
  public constructor(
    private readonly userService: UserService,
    private readonly bcryptService: BcryptService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
    private readonly resetPasswordSessionRepository: ResetPasswordSessionRepository,
    private readonly prismaService: PrismaService,
  ) {}

  public async completeResetPassword({ sessionId, newPassword }: ResetPasswordCompleteDto): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const { userId } = await this.resetPasswordSessionRepository.markAsConsumed(sessionId, tx)
      const user = await this.userService.findById(userId, {}, tx)
      const isPasswordsMatches = await this.bcryptService.compare(newPassword, user?.password)

      if (isPasswordsMatches) {
        throw new BadRequestException('The new password cannot be the same as the current password.')
      }

      const newHashedPassword = await this.bcryptService.hash(newPassword)
      await this.userService.update(userId, { password: newHashedPassword }, tx)
    })
  }

  public async confirmResetPassword({ ticket, code }: ConfirmOtpCodeDto): Promise<ResetPasswordSessionApiModel> {
    const resetPasswordSession = await this.prismaService.$transaction(async (tx) => {
      const userEmail = await this.otpService.confirmCode(ticket, code, OtpCodeType.PASSWORD_RESET, tx)
      const user = await this.userService.findByEmail(userEmail, {}, tx)

      if (!user) {
        throw new AppEntityNotFoundException('User', { email: userEmail })
      }

      await StatusPolicy.enforce(user)

      if (user.status === UserStatus.UNVERIFIED) {
        await this.userService.update(user.id, { status: UserStatus.ACTIVE }, tx)
      }

      return this.resetPasswordSessionRepository.create(user, tx)
    })

    return ResetPasswordSessionApiModel.from(resetPasswordSession)
  }

  public async sendResetPasswordMail(email: string): Promise<OtpTicketApiModel> {
    const user = await this.userService.findByEmail(email)

    if (!user) {
      throw new AppEntityNotFoundException('User', { email })
    }

    await StatusPolicy.enforce(user)

    const retryAfterSec = this.mailService.canSendMailAfterSeconds(user.lastResetPasswordMailSentAt)

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
    const hashedCode = this.otpService.hashCode(otpCode, { scope: OtpCodeType.PASSWORD_RESET, identity: email })
    await this.mailService.sendResetPasswordMail(otpCode, email, user.firstName)
    await this.userService.update(user.id, {
      lastResetPasswordMailSentAt: new Date(),
    })
    const otpEntity = await this.otpService.saveCode(hashedCode, user, OtpCodeType.PASSWORD_RESET)
    return OtpTicketApiModel.from(otpEntity)
  }

  public async setPassword(user: User, password: string): Promise<void> {
    await StatusPolicy.enforce(user, true)

    if (user.password) {
      throw new ConflictException('The password has already been set.')
    }

    await this.updateUserPassword(user.id, password)
  }

  public async changePassword(user: User, changePasswordDto: ChangePasswordDto): Promise<void> {
    await StatusPolicy.enforce(user, true)
    const { currentPassword, newPassword } = changePasswordDto

    if (!user.password) {
      throw new ConflictException('No password has been set for this account.')
    }

    const isCurrentPasswordsMatches = await this.bcryptService.compare(currentPassword, user.password)

    if (!isCurrentPasswordsMatches) {
      throw new BadRequestException('The current password is incorrect.')
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('The new password cannot be the same as the current password.')
    }

    await this.updateUserPassword(user.id, newPassword)
  }

  private async updateUserPassword(userId: Uuid, password: string): Promise<void> {
    const hashedPassword = await this.bcryptService.hash(password)
    await this.userService.update(userId, { password: hashedPassword })
  }
}
