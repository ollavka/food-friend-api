import { Injectable } from '@nestjs/common'
import { BackgroundJob, BackgroundJobStatus, Prisma } from '@prisma/client'
import { Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'

@Injectable()
export class BackgroundJobRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findBackgroundJobById(id: Uuid): Promise<BackgroundJob | null> {
    return this.prismaService.backgroundJob.findUnique({
      where: {
        id,
      },
    })
  }

  public async findPendingBackgroundJobIds(limit: number, runAtLte: Date): Promise<Uuid[]> {
    const jobs = await this.prismaService.backgroundJob.findMany({
      where: {
        status: BackgroundJobStatus.PENDING,
        runAt: {
          lte: runAtLte,
        },
      },
      orderBy: {
        runAt: 'asc',
      },
      select: {
        id: true,
      },
      take: limit,
    })

    return jobs.map((job) => <Uuid>job.id)
  }

  public async claimBackgroundJobForProcessing(
    id: Uuid,
    workerId: string,
    lockExpiresAt: Date,
  ): Promise<BackgroundJob | null> {
    const now = new Date()

    return this.prismaService.$transaction(async (tx) => {
      const { count } = await tx.backgroundJob.updateMany({
        where: {
          id,
          status: BackgroundJobStatus.PENDING,
          runAt: {
            lte: now,
          },
        },
        data: {
          status: BackgroundJobStatus.PROCESSING,
          attempts: {
            increment: 1,
          },
          startedAt: now,
          finishedAt: null,
          lockedBy: workerId,
          lockExpires: lockExpiresAt,
        },
      })

      if (count === 0) {
        return null
      }

      return tx.backgroundJob.findUnique({
        where: {
          id,
        },
      })
    })
  }

  public async completeBackgroundJob(id: Uuid, result: Prisma.InputJsonValue): Promise<void> {
    await this.prismaService.backgroundJob.update({
      where: {
        id,
      },
      data: {
        status: BackgroundJobStatus.COMPLETED,
        result,
        error: Prisma.JsonNull,
        finishedAt: new Date(),
        lockedBy: null,
        lockExpires: null,
      },
    })
  }

  public async rescheduleBackgroundJob(id: Uuid, error: Prisma.InputJsonValue, runAt: Date): Promise<void> {
    await this.prismaService.backgroundJob.update({
      where: {
        id,
      },
      data: {
        status: BackgroundJobStatus.PENDING,
        error,
        runAt,
        startedAt: null,
        finishedAt: null,
        lockedBy: null,
        lockExpires: null,
      },
    })
  }

  public async failBackgroundJob(id: Uuid, error: Prisma.InputJsonValue): Promise<void> {
    await this.prismaService.backgroundJob.update({
      where: {
        id,
      },
      data: {
        status: BackgroundJobStatus.FAILED,
        error,
        finishedAt: new Date(),
        lockedBy: null,
        lockExpires: null,
      },
    })
  }
}
