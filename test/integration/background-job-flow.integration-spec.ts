import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Test, TestingModule } from '@nestjs/testing'
import { BackgroundJobStatus, BackgroundJobType, UserRole } from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { BACKGROUND_JOB_HANDLERS_TOKEN } from '@core/background-job/constant'
import { BackgroundJobController } from '@core/background-job/controller'
import { BackgroundJobRepository } from '@core/background-job/repository'
import { BackgroundJobService } from '@core/background-job/service'
import { BackgroundJobHandler } from '@core/background-job/type'
import { PrismaService } from '@infrastructure/database'

const JOB_ID = '11111111-1111-4111-8111-111111111111'
const RETRY_JOB_ID = '22222222-2222-4222-8222-222222222222'
const USER_ID = '33333333-3333-4333-8333-333333333333'

type MutableJob = {
  id: string
  type: BackgroundJobType
  status: BackgroundJobStatus
  attempts: number
  maxAttempts: number
  dedupKey: string
  userId: string | null
  recipeId: string | null
  payload: Record<string, unknown>
  result: Record<string, unknown> | null
  error: Record<string, unknown> | null
  runAt: Date
  startedAt: Date | null
  finishedAt: Date | null
  lockedBy: string | null
  lockExpires: Date | null
  createdAt: Date
  updatedAt: Date
}

function cloneJob(job: MutableJob): MutableJob {
  return {
    ...job,
    runAt: new Date(job.runAt),
    startedAt: job.startedAt ? new Date(job.startedAt) : null,
    finishedAt: job.finishedAt ? new Date(job.finishedAt) : null,
    lockExpires: job.lockExpires ? new Date(job.lockExpires) : null,
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
    payload: { ...job.payload },
    result: job.result ? { ...job.result } : null,
    error: job.error ? { ...job.error } : null,
  }
}

describe('Background job integration flow', () => {
  let testingModule: TestingModule
  let backgroundJobService: BackgroundJobService
  let backgroundJobController: BackgroundJobController
  let jobs: Map<string, MutableJob>
  let handlerImplementation: () => Promise<Record<string, unknown>>

  const applyUpdateData = (job: MutableJob, data: Record<string, unknown>): void => {
    for (const [key, value] of Object.entries(data)) {
      if (key === 'attempts' && value && typeof value === 'object' && 'increment' in value) {
        job.attempts += Number((value as { increment: number }).increment ?? 0)
        continue
      }

      if (key === 'error' && String(value) === 'JsonNull') {
        job.error = null
        continue
      }

      ;(job as Record<string, unknown>)[key] = value as unknown
    }

    job.updatedAt = new Date()
  }

  const createJob = (id: string, maxAttempts = 3): MutableJob => {
    const now = new Date()
    return {
      id,
      type: BackgroundJobType.PRODUCT_TRANSLATION,
      status: BackgroundJobStatus.PENDING,
      attempts: 0,
      maxAttempts,
      dedupKey: `job-${id}`,
      userId: USER_ID,
      recipeId: null,
      payload: { id },
      result: null,
      error: null,
      runAt: new Date(now.getTime() - 1_000),
      startedAt: null,
      finishedAt: null,
      lockedBy: null,
      lockExpires: null,
      createdAt: now,
      updatedAt: now,
    }
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    handlerImplementation = async () => ({ success: true })
    jobs = new Map<string, MutableJob>([
      [JOB_ID, createJob(JOB_ID)],
      [RETRY_JOB_ID, createJob(RETRY_JOB_ID, 2)],
    ])

    const prismaServiceMock: any = {
      backgroundJob: {
        findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
          const job = jobs.get(where.id)
          return job ? cloneJob(job) : null
        }),
        findMany: jest.fn(async ({ where, take }: any) => {
          const entries = [...jobs.values()]
            .filter((job) => job.status === where.status && job.runAt.getTime() <= new Date(where.runAt.lte).getTime())
            .sort((left, right) => left.runAt.getTime() - right.runAt.getTime())
          const limit = typeof take === 'number' ? take : entries.length
          const limitedEntries = entries.slice(0, limit)

          return limitedEntries.map((job) => ({ id: job.id }))
        }),
        update: jest.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
          const job = jobs.get(where.id)

          if (!job) {
            throw new Error('Background job not found')
          }

          applyUpdateData(job, data)
          return cloneJob(job)
        }),
      },
      $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) =>
        callback({
          backgroundJob: {
            updateMany: jest.fn(
              async ({
                where,
                data,
              }: {
                where: { id: string; status: BackgroundJobStatus; runAt: { lte: Date } }
                data: Record<string, unknown>
              }) => {
                const job = jobs.get(where.id)

                if (!job) {
                  return { count: 0 }
                }

                const canClaim =
                  job.status === where.status && job.runAt.getTime() <= new Date(where.runAt.lte).getTime()

                if (!canClaim) {
                  return { count: 0 }
                }

                applyUpdateData(job, data)
                return { count: 1 }
              },
            ),
            findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
              const job = jobs.get(where.id)
              return job ? cloneJob(job) : null
            }),
          },
        }),
      ),
    }

    const successHandler: BackgroundJobHandler = {
      supportedTypes: [BackgroundJobType.PRODUCT_TRANSLATION],
      handle: jest.fn(async () => handlerImplementation()),
    }

    testingModule = await Test.createTestingModule({
      controllers: [BackgroundJobController],
      providers: [
        BackgroundJobService,
        BackgroundJobRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: BACKGROUND_JOB_HANDLERS_TOKEN,
          useValue: [successHandler],
        },
      ],
    }).compile()

    backgroundJobService = testingModule.get(BackgroundJobService)
    backgroundJobController = testingModule.get(BackgroundJobController)
  })

  it('should claim and complete pending background job via service and repository chain', async () => {
    const pendingJobIds = await backgroundJobService.getPendingBackgroundJobIdsForDispatch(10)
    expect(pendingJobIds).toContain(JOB_ID)

    await backgroundJobService.processBackgroundJob(JOB_ID as never, 'worker-1')

    const completedJob = jobs.get(JOB_ID)!

    expect(completedJob.status).toBe(BackgroundJobStatus.COMPLETED)
    expect(completedJob.attempts).toBe(1)
    expect(completedJob.result).toEqual({ success: true })
    expect(completedJob.lockedBy).toBeNull()
  })

  it('should reschedule retryable error and fail after retry limit', async () => {
    handlerImplementation = async () => {
      throw new Error('Temporary provider error')
    }

    await backgroundJobService.processBackgroundJob(RETRY_JOB_ID as never, 'worker-2')

    const afterFirstAttempt = jobs.get(RETRY_JOB_ID)!
    expect(afterFirstAttempt.status).toBe(BackgroundJobStatus.PENDING)
    expect(afterFirstAttempt.attempts).toBe(1)
    expect(afterFirstAttempt.error).toEqual(
      expect.objectContaining({
        reason: 'Temporary provider error',
        retryable: true,
      }),
    )

    afterFirstAttempt.runAt = new Date(Date.now() - 1_000)
    await backgroundJobService.processBackgroundJob(RETRY_JOB_ID as never, 'worker-2')

    const failedJob = jobs.get(RETRY_JOB_ID)!
    expect(failedJob.status).toBe(BackgroundJobStatus.FAILED)
    expect(failedJob.attempts).toBe(2)
    expect(failedJob.finishedAt).toBeInstanceOf(Date)
  })

  it('should allow owner and deny non-owner in controller job polling endpoint', async () => {
    const ownerResult = await backgroundJobController.getBackgroundJobById(
      JOB_ID as never,
      {
        id: USER_ID,
        role: UserRole.REGULAR,
      } as never,
    )

    expect(ownerResult.id).toBe(JOB_ID)

    await expect(
      backgroundJobController.getBackgroundJobById(
        JOB_ID as never,
        {
          id: '99999999-9999-4999-8999-999999999999',
          role: UserRole.REGULAR,
        } as never,
      ),
    ).rejects.toBeInstanceOf(AccessControlAuthorizationException)

    const adminResult = await backgroundJobController.getBackgroundJobById(
      JOB_ID as never,
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        role: UserRole.ADMIN,
      } as never,
    )

    expect(adminResult.id).toBe(JOB_ID)
  })
})
