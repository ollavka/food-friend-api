import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { OtpCodeStatus } from '@prisma/client'
import { PrismaService } from '@infrastructure/database'

@Injectable()
export class CleanupOtpCodesJob {
  private readonly logger = new Logger(CleanupOtpCodesJob.name)

  public constructor(private readonly prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'cleanup-otp-codes', timeZone: 'Europe/Kyiv' })
  public async handle(): Promise<void> {
    this.logger.log('Start cleanup OTP codes...')
    const currentDate = new Date()

    const { count: otpCodesCount } = await this.prismaService.otpCode.deleteMany({
      where: {
        OR: [
          {
            status: OtpCodeStatus.EXPIRED,
          },
          {
            status: OtpCodeStatus.USED,
          },
          {
            expiresAt: {
              lt: currentDate,
            },
          },
        ],
      },
    })

    this.logger.log(`Removed ${otpCodesCount} expired or used OTP codes`)
  }
}
