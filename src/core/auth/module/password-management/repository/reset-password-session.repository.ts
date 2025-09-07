import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma, ResetPasswordSession, User } from '@prisma/client'
import { addMinutes } from 'date-fns'
import { RESET_SESSION_TTL_MINS } from '@common/constant'
import { AppEntityNotFoundException } from '@common/exception'
import { Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'

@Injectable()
export class ResetPasswordSessionRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async create(user: User, tx?: Prisma.TransactionClient): Promise<ResetPasswordSession> {
    const now = new Date()
    const expiresAt = addMinutes(now, RESET_SESSION_TTL_MINS)
    const db = tx ?? this.prismaService

    const session = await db.resetPasswordSession.upsert({
      where: {
        userId: user.id,
      },
      create: {
        email: user.email,
        user: {
          connect: { id: user.id },
        },
        expiresAt,
      },
      update: {
        expiresAt,
        consumedAt: null,
      },
    })

    return session
  }

  public async markAsConsumed(sessionId: Uuid, tx?: Prisma.TransactionClient): Promise<ResetPasswordSession> {
    const now = new Date()
    const db = tx ?? this.prismaService

    const { count: sessionCount } = await db.resetPasswordSession.updateMany({
      where: { id: sessionId, consumedAt: null, expiresAt: { gt: now } },
      data: { consumedAt: now },
    })

    if (sessionCount !== 1) {
      throw new BadRequestException('Invalid or expired reset password session.')
    }

    const currentSession = await db.resetPasswordSession.findUnique({ where: { id: sessionId } })

    if (!currentSession) {
      throw new AppEntityNotFoundException('Reset password session', { id: sessionId })
    }

    return currentSession
  }
}
