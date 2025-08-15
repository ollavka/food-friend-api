import { randomInt } from 'node:crypto'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OtpCode, OtpCodeType } from '@prisma/client'
import { addMilliseconds, addMinutes, differenceInSeconds, isBefore } from 'date-fns'
import { HASH_PEPPER_KEY } from '@common/constant'
import { AppEntityNotFoundException, AppGoneException, AppRateLimitException } from '@common/exception'
import { Uuid } from '@common/type'
import { hashValue } from '@common/util'
import { MAX_ATTEMPTS_PER_WINDOW, WINDOW_MS } from '../constant'
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

  public async saveCode(
    hashedCode: string,
    email: string,
    type: OtpCodeType,
    codeTtlMins: number = 10,
  ): Promise<OtpCode> {
    const expiresAt = addMinutes(new Date(), codeTtlMins)
    const otpCode = await this.otpRepository.saveCode(hashedCode, email, type, expiresAt)
    return otpCode
  }

  public generateCode(): string {
    const min = 100_000
    const max = 1_000_000
    const randomNumber = randomInt(min, max)
    return randomNumber.toString().padStart(6, '0')
  }

  public hashCode(code: string, params: HashOtpCodeParams): string {
    const formattedCode = this.formatCodeRaw(code, params)
    const hashedCode = hashValue(formattedCode)
    return hashedCode
  }

  public async confirmCode(ticket: Uuid, code: string, scope: OtpCodeType): Promise<string> {
    const now = new Date()
    const foundOtpCode = await this.otpRepository.findById(ticket)

    if (!foundOtpCode) {
      throw new AppEntityNotFoundException('OTP', { id: ticket })
    }

    const otpIsExpired = isBefore(foundOtpCode.expiresAt, now)

    if (otpIsExpired) {
      await this.otpRepository.removeById(ticket)
      throw new AppGoneException('otp-expired', 'OTP code is expired.')
    }

    const started = foundOtpCode.windowStartedAt ?? now
    const windowEndsAt = addMilliseconds(started, WINDOW_MS)
    const windowClosed = now >= windowEndsAt

    let attempts = foundOtpCode.attempts
    let windowStartedAt = foundOtpCode.windowStartedAt

    if (windowClosed || !windowStartedAt) {
      attempts = 1
      windowStartedAt = now
    } else if (attempts >= MAX_ATTEMPTS_PER_WINDOW) {
      const retryAfterSec = differenceInSeconds(windowEndsAt, now)
      await this.otpRepository.updateCode(ticket, { attempts, windowStartedAt })
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
      await this.otpRepository.removeById(ticket)
      return foundOtpCode.email
    }

    await this.otpRepository.updateCode(ticket, { attempts, windowStartedAt })
    throw new BadRequestException('Invalid OTP code.')
  }
}
