import { describe, expect, it, jest } from '@jest/globals'
import { OtpCodeStatus } from '@prisma/client'
import { CleanupOtpCodesJob } from './cleanup-otp-codes.job'

describe('CleanupOtpCodesJob', () => {
  it('should delete expired and used otp codes', async () => {
    const prismaService: any = {
      otpCode: {
        deleteMany: jest.fn(),
      },
    }
    ;(prismaService.otpCode.deleteMany as any).mockResolvedValue({ count: 3 })

    const job = new CleanupOtpCodesJob(prismaService)

    await job.handle()

    expect(prismaService.otpCode.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { status: OtpCodeStatus.EXPIRED },
          { status: OtpCodeStatus.USED },
          { expiresAt: { lt: expect.any(Date) } },
        ],
      },
    })
  })
})
