import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { OtpCodeStatus, OtpCodeType } from '@prisma/client'
import { OTP_CODE_LENGTH } from '@common/constant'
import { AppBadRequestException, AppEntityNotFoundException, AppGoneException } from '@common/exception'
import { OtpService } from './otp.service'

const TICKET_ID = '11111111-1111-4111-8111-111111111111'
const EMAIL = 'user@example.com'

describe('OtpService', () => {
  const configService: any = {
    get: jest.fn(),
  }

  const otpRepository: any = {
    findById: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    updateMany: jest.fn(),
  }

  let service: OtpService

  beforeEach(() => {
    jest.clearAllMocks()
    configService.get.mockReturnValue('pepper-value')
    service = new OtpService(configService, otpRepository)
  })

  it('should generate numeric code with configured length', () => {
    const code = service.generateCode()

    expect(code).toMatch(/^\d+$/)
    expect(code.length).toBe(OTP_CODE_LENGTH)
  })

  it('should hash otp code deterministically', () => {
    const hash1 = service.hashCode('1234', { identity: EMAIL, scope: OtpCodeType.EMAIL_VERIFICATION })
    const hash2 = service.hashCode('1234', { identity: EMAIL, scope: OtpCodeType.EMAIL_VERIFICATION })

    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[a-f0-9]{64}$/)
  })

  it('should validate status and throw on mismatch', () => {
    expect(() =>
      service.validateStatus({ status: OtpCodeStatus.PENDING } as never, OtpCodeStatus.PENDING),
    ).not.toThrow()

    expect(() => service.validateStatus(null, OtpCodeStatus.PENDING)).toThrow(AppBadRequestException)
  })

  it('should throw not found when otp ticket does not exist', async () => {
    otpRepository.findById.mockResolvedValue(null)

    await expect(
      service.confirmCode(TICKET_ID as never, '1234', OtpCodeType.EMAIL_VERIFICATION),
    ).rejects.toBeInstanceOf(AppEntityNotFoundException)
  })

  it('should throw gone when otp is expired', async () => {
    otpRepository.findById.mockResolvedValue({
      id: TICKET_ID,
      email: EMAIL,
      codeHash: 'hash',
      status: OtpCodeStatus.PENDING,
      attempts: 0,
      windowStartedAt: null,
      expiresAt: new Date(Date.now() - 5_000),
    })

    await expect(
      service.confirmCode(TICKET_ID as never, '1234', OtpCodeType.EMAIL_VERIFICATION),
    ).rejects.toBeInstanceOf(AppGoneException)
  })

  it('should confirm valid otp code', async () => {
    const code = '1234'
    const codeHash = service.hashCode(code, { identity: EMAIL, scope: OtpCodeType.EMAIL_VERIFICATION })

    otpRepository.findById.mockResolvedValue({
      id: TICKET_ID,
      email: EMAIL,
      codeHash,
      status: OtpCodeStatus.PENDING,
      attempts: 0,
      windowStartedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    })
    otpRepository.updateMany.mockResolvedValue(1)

    const result = await service.confirmCode(TICKET_ID as never, code, OtpCodeType.EMAIL_VERIFICATION)

    expect(result).toEqual({ email: EMAIL })
    expect(otpRepository.updateMany).toHaveBeenCalled()
  })
})
