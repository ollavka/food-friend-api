import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { OtpCodeType } from '@prisma/client'
import { OtpRepository } from './otp.repository'

const OTP_ID = '11111111-1111-4111-8111-111111111111'
const USER_ID = '22222222-2222-4222-8222-222222222222'

describe('OtpRepository', () => {
  const prismaService: any = {
    otpCode: {
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn(),
    },
  }

  let repository: OtpRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new OtpRepository(prismaService)
  })

  it('should find otp by id', async () => {
    prismaService.otpCode.findUnique.mockResolvedValue({ id: OTP_ID })

    const result = await repository.findById(OTP_ID as never)

    expect(result).toEqual({ id: OTP_ID })
    expect(prismaService.otpCode.findUnique).toHaveBeenCalledWith({ where: { id: OTP_ID } })
  })

  it('should remove otp by id', async () => {
    prismaService.otpCode.deleteMany.mockResolvedValue({ count: 1 })

    await expect(repository.removeById(OTP_ID as never)).resolves.toBe(true)
    expect(prismaService.otpCode.deleteMany).toHaveBeenCalledWith({ where: { id: OTP_ID } })
  })

  it('should update and updateMany otp records', async () => {
    prismaService.otpCode.update.mockResolvedValue({ id: OTP_ID, attempts: 1 })
    prismaService.otpCode.updateMany.mockResolvedValue({ count: 2 })

    await repository.update(OTP_ID as never, { attempts: 1 } as never)
    const count = await repository.updateMany({ email: 'a@a.com' } as never, { attempts: 2 } as never)

    expect(count).toBe(2)
    expect(prismaService.otpCode.update).toHaveBeenCalled()
    expect(prismaService.otpCode.updateMany).toHaveBeenCalled()
  })

  it('should save otp with upsert contract', async () => {
    prismaService.otpCode.upsert.mockResolvedValue({ id: OTP_ID })

    const result = await repository.save(
      'hash-code',
      {
        id: USER_ID,
        email: 'user@example.com',
      } as never,
      OtpCodeType.EMAIL_VERIFICATION,
      new Date('2026-01-01T00:00:00.000Z'),
    )

    expect(result).toEqual({ id: OTP_ID })
    expect(prismaService.otpCode.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          email_type: {
            email: 'user@example.com',
            type: OtpCodeType.EMAIL_VERIFICATION,
          },
        },
      }),
    )
  })
})
