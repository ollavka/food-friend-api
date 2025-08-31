import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '@infrastructure/database'
import { TokenDelegate, TokenType } from './type'

@Injectable()
export class CleanupExpiredTokensJob {
  private readonly logger = new Logger(CleanupExpiredTokensJob.name)

  public constructor(private readonly prismaService: PrismaService) {}

  private async removeTokensOrCodes(tokenType: TokenType, currentDate: Date): Promise<number> {
    const { count } = await (this.prismaService[tokenType] as TokenDelegate).deleteMany({
      where: { expiresAt: { lt: currentDate } },
    })

    return count
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'cleanup-expired-tokens', timeZone: 'Europe/Kyiv' })
  public async handle(): Promise<void> {
    this.logger.log('Start cleanup expired tokens...')

    const currentDate = new Date()

    const [refreshTokensCount, otpCodeCount] = await Promise.all([
      this.removeTokensOrCodes('refreshToken', currentDate),
      this.removeTokensOrCodes('otpCode', currentDate),
    ])

    this.logger.log(`Removed ${refreshTokensCount} expired refresh tokens`)
    this.logger.log(`Removed ${otpCodeCount} expired OTP codes`)
  }
}
