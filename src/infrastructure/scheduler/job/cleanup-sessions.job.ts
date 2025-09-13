import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { UserStatus } from '@prisma/client'
import { PrismaService } from '@infrastructure/database'

@Injectable()
export class CleanupSessionsJob {
  private readonly logger = new Logger(CleanupSessionsJob.name)

  public constructor(private readonly prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'cleanup-sessions', timeZone: 'Europe/Kyiv' })
  public async handle(): Promise<void> {
    this.logger.log('Start cleanup sessions...')
    const currentDate = new Date()

    const { count: sessionsCount } = await this.prismaService.session.deleteMany({
      where: {
        OR: [
          {
            isRevoked: true,
          },
          {
            user: {
              status: UserStatus.BLOCKED,
            },
          },
          {
            expiresAt: {
              lt: currentDate,
            },
          },
        ],
      },
    })

    this.logger.log(`Removed ${sessionsCount} expired or revoked sessions`)
  }
}
