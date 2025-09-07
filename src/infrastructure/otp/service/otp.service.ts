import { randomInt } from 'node:crypto'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OtpCode, OtpCodeType, Prisma, User } from '@prisma/client'
import { addMilliseconds, addMinutes, differenceInSeconds, isBefore } from 'date-fns'
import { HASH_PEPPER_KEY, OTP_CODE_LENGTH, OTP_CODE_TTL_MINS } from '@common/constant'
import { AppEntityNotFoundException, AppGoneException, AppRateLimitException } from '@common/exception'
import { Uuid } from '@common/type'
import { hashValue } from '@common/util'
import { MAX_OTP_ATTEMPTS_PER_WINDOW, OTP_WINDOW_MS } from '../constant'
import { OtpRepository } from '../repository'
import { HashOtpCodeParams } from '../type'

@Injectable()
export class OtpService {
  private hashPepper: string

  public constructor(
    private readonly configService: ConfigService<{ [HASH_PEPPER_KEY]: string }, true>,
    private readonly otpRepository: OtpRepository,
  ) {
    this.hashPepper = configService.get<string>(HASH_PEPPER_KEY)
  }

  private formatCodeRaw(code: string, { identity, scope }: HashOtpCodeParams): string {
    const formattedCode = `${identity}:${scope}:${code}:${this.hashPepper}`
    return formattedCode
  }

  public async saveCode(hashedCode: string, user: User, type: OtpCodeType): Promise<OtpCode> {
    const expiresAt = addMinutes(new Date(), OTP_CODE_TTL_MINS)
    const otpCode = await this.otpRepository.saveCode(hashedCode, user, type, expiresAt)
    return otpCode
  }

  public generateCode(): string {
    const min = 10 ** (OTP_CODE_LENGTH - 1)
    const max = 10 ** OTP_CODE_LENGTH
    const randomNumber = randomInt(min, max)
    return randomNumber.toString().padStart(OTP_CODE_LENGTH, '0')
  }

  public hashCode(code: string, params: HashOtpCodeParams): string {
    const formattedCode = this.formatCodeRaw(code, params)
    const hashedCode = hashValue(formattedCode)
    return hashedCode
  }

  public async confirmCode(
    ticket: Uuid,
    code: string,
    scope: OtpCodeType,
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const now = new Date()
    const foundOtpCode = await this.otpRepository.findById(ticket, tx)

    if (!foundOtpCode) {
      throw new AppEntityNotFoundException('OTP', { id: ticket })
    }

    const otpIsExpired = isBefore(foundOtpCode.expiresAt, now)

    if (otpIsExpired) {
      await this.otpRepository.removeById(ticket, tx)
      throw new AppGoneException('otp-expired', 'OTP code is expired.')
    }

    const started = foundOtpCode.windowStartedAt ?? now
    const windowEndsAt = addMilliseconds(started, OTP_WINDOW_MS)
    const windowClosed = now >= windowEndsAt

    let attempts = foundOtpCode.attempts
    let windowStartedAt = foundOtpCode.windowStartedAt

    if (windowClosed || !windowStartedAt) {
      attempts = 1
      windowStartedAt = now
    } else if (attempts >= MAX_OTP_ATTEMPTS_PER_WINDOW) {
      const retryAfterSec = differenceInSeconds(windowEndsAt, now)
      await this.otpRepository.updateCode(ticket, { attempts, windowStartedAt }, tx)
      throw new AppRateLimitException(
        'otp',
        `You have exceeded the rate limit. Please try again in ${retryAfterSec} seconds.`,
        {
          secondsLeft: retryAfterSec,
        },
      )
    } else {
      attempts++
    }

    const currentOtpHash = this.hashCode(code, { scope, identity: foundOtpCode.email })
    const isValidOtp = currentOtpHash === foundOtpCode.codeHash

    if (isValidOtp) {
      await this.otpRepository.removeById(ticket, tx)
      return foundOtpCode.email
    }

    await this.otpRepository.updateCode(ticket, { attempts, windowStartedAt }, tx)
    throw new BadRequestException('Invalid OTP code.')
  }
}
