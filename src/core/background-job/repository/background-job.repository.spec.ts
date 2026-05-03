import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BackgroundJobStatus } from '@prisma/client'
import { BackgroundJobRepository } from './background-job.repository'

const JOB_ID = '11111111-1111-4111-8111-111111111111'

describe('BackgroundJobRepository', () => {
  const prismaService: any = {
    backgroundJob: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  }

  let repository: BackgroundJobRepository

  beforeEach(() => {
    jest.clearAllMocks()

    const updateManyMock = (jest.fn() as any).mockResolvedValue({ count: 1 })
    const findUniqueMock = (jest.fn() as any).mockResolvedValue({ id: JOB_ID })

    prismaService.$transaction.mockImplementation((callback: (tx: any) => unknown) =>
      callback({
        backgroundJob: {
          updateMany: updateManyMock,
          findUnique: findUniqueMock,
        },
      }),
    )

    repository = new BackgroundJobRepository(prismaService)
  })

  it('should find background job by id and pending ids', async () => {
    prismaService.backgroundJob.findUnique.mockResolvedValue({ id: JOB_ID })
    prismaService.backgroundJob.findMany.mockResolvedValue([{ id: JOB_ID }])

    const job = await repository.findBackgroundJobById(JOB_ID as never)
    const ids = await repository.findPendingBackgroundJobIds(10, new Date())

    expect(job).toEqual({ id: JOB_ID })
    expect(ids).toEqual([JOB_ID])
  })

  it('should claim job for processing when update succeeds', async () => {
    const result = await repository.claimBackgroundJobForProcessing(
      JOB_ID as never,
      'worker-1',
      new Date(Date.now() + 60_000),
    )

    expect(result).toEqual({ id: JOB_ID })
  })

  it('should return null when job claim update count is zero', async () => {
    const updateManyMock = (jest.fn() as any).mockResolvedValue({ count: 0 })
    const findUniqueMock = jest.fn() as any

    prismaService.$transaction.mockImplementation((callback: (tx: any) => unknown) =>
      callback({
        backgroundJob: {
          updateMany: updateManyMock,
          findUnique: findUniqueMock,
        },
      }),
    )

    const result = await repository.claimBackgroundJobForProcessing(
      JOB_ID as never,
      'worker-1',
      new Date(Date.now() + 60_000),
    )

    expect(result).toBeNull()
  })

  it('should complete, reschedule and fail background job', async () => {
    await repository.completeBackgroundJob(JOB_ID as never, { ok: true } as never)
    await repository.rescheduleBackgroundJob(JOB_ID as never, { reason: 'retry' } as never, new Date())
    await repository.failBackgroundJob(JOB_ID as never, { reason: 'failed' } as never)

    expect(prismaService.backgroundJob.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: JOB_ID },
        data: expect.objectContaining({
          status: BackgroundJobStatus.COMPLETED,
        }),
      }),
    )

    expect(prismaService.backgroundJob.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: JOB_ID },
        data: expect.objectContaining({
          status: BackgroundJobStatus.PENDING,
        }),
      }),
    )

    expect(prismaService.backgroundJob.update).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        where: { id: JOB_ID },
        data: expect.objectContaining({
          status: BackgroundJobStatus.FAILED,
        }),
      }),
    )
  })
})
