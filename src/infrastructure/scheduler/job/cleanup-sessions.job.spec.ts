import { describe, expect, it, jest } from '@jest/globals'
import { UserStatus } from '@prisma/client'
import { CleanupSessionsJob } from './cleanup-sessions.job'

describe('CleanupSessionsJob', () => {
  it('should delete revoked, blocked and expired sessions', async () => {
    const prismaService: any = {
      session: {
        deleteMany: jest.fn(),
      },
    }
    ;(prismaService.session.deleteMany as any).mockResolvedValue({ count: 4 })

    const job = new CleanupSessionsJob(prismaService)

    await job.handle()

    expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [{ isRevoked: true }, { user: { status: UserStatus.BLOCKED } }, { expiresAt: { lt: expect.any(Date) } }],
      },
    })
  })
})
