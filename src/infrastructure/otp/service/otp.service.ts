import { randomInt } from 'node:crypto'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OtpCode, OtpCodeStatus, OtpCodeType, Prisma, User } from '@prisma/client'
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

  public async findById(id: Uuid, tx?: Prisma.TransactionClient): Promise<OtpCode | null> {
    return this.otpRepository.findById(id, tx)
  }

  public async update(
    id: Uuid,
    data: Pick<Prisma.OtpCodeUpdateInput, 'attempts' | 'expiresAt' | 'windowStartedAt' | 'status'>,
    tx?: Prisma.TransactionClient,
  ): Promise<OtpCode> {
    return this.otpRepository.update(id, data, tx)
  }

  public validateStatus(otpCode: OtpCode | null, status: OtpCodeStatus): OtpCode {
    if (!otpCode || otpCode.status !== status) {
      throw new BadRequestException('OTP is not available.')
    }

    return otpCode
  }

  public async saveCode(hashedCode: string, user: User, type: OtpCodeType): Promise<OtpCode> {
    const expiresAt = addMinutes(new Date(), OTP_CODE_TTL_MINS)
    const otpCode = await this.otpRepository.save(hashedCode, user, type, expiresAt)
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

  public async confirmCode(ticket: Uuid, code: string, scope: OtpCodeType): Promise<{ email: string }> {
    const now = new Date()
    const foundOtpCode = await this.otpRepository.findById(ticket)

    if (!foundOtpCode) {
      throw new AppEntityNotFoundException('OTP', { id: ticket })
    }
    const otpIsExpired = isBefore(foundOtpCode.expiresAt, now)

    if (otpIsExpired) {
      if (foundOtpCode.status !== OtpCodeStatus.EXPIRED) {
        await this.otpRepository.update(ticket, { status: OtpCodeStatus.EXPIRED })
      }

      throw new AppGoneException('otp-expired', 'OTP code is expired.')
    }

    if (foundOtpCode.status !== OtpCodeStatus.PENDING) {
      throw new BadRequestException('OTP code is not available.')
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
      await this.otpRepository.update(ticket, { attempts, windowStartedAt })
      throw new AppRateLimitException('otp', {
        secondsLeft: retryAfterSec,
      })
    } else {
      attempts++
    }

    const currentOtpHash = this.hashCode(code, { scope, identity: foundOtpCode.email })
    const isValidOtp = currentOtpHash === foundOtpCode.codeHash

    if (!isValidOtp) {
      await this.otpRepository.update(ticket, { attempts, windowStartedAt })
      throw new BadRequestException('Invalid OTP code.')
    }

    const consumedCodesCount = await this.otpRepository.updateMany(
      { id: ticket, status: OtpCodeStatus.PENDING },
      { status: OtpCodeStatus.CONSUMED },
    )

    if (consumedCodesCount !== 1) {
      throw new BadRequestException('OTP code is not available.')
    }

    return { email: foundOtpCode.email }
  }

  private formatCodeRaw(code: string, { identity, scope }: HashOtpCodeParams): string {
    const formattedCode = `${identity}:${scope}:${code}:${this.hashPepper}`
    return formattedCode
  }
}
