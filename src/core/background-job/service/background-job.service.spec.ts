import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BackgroundJobStatus, BackgroundJobType, UserRole } from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { AppEntityNotFoundException } from '@common/exception'
import { NonRetryableBackgroundJobError } from '../type'
import { BackgroundJobService } from './background-job.service'

const JOB_ID = '11111111-1111-4111-8111-111111111111'
const OWNER_ID = '22222222-2222-4222-8222-222222222222'
const FOREIGN_USER_ID = '33333333-3333-4333-8333-333333333333'

function createBackgroundJobEntity(overrides: Partial<any> = {}): any {
  const now = new Date('2026-01-01T00:00:00.000Z')

  return {
    id: JOB_ID,
    type: BackgroundJobType.SEARCH_SYNC_PRODUCT,
    status: BackgroundJobStatus.PENDING,
    payload: {
      productId: '44444444-4444-4444-8444-444444444444',
      action: 'UPSERT',
    },
    result: null,
    error: null,
    attempts: 1,
    maxAttempts: 3,
    runAt: now,
    startedAt: null,
    finishedAt: null,
    lockExpires: null,
    lockedBy: null,
    dedupKey: null,
    userId: OWNER_ID,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('BackgroundJobService', () => {
  const backgroundJobRepository: any = {
    findBackgroundJobById: jest.fn(),
    findPendingBackgroundJobIds: jest.fn(),
    claimBackgroundJobForProcessing: jest.fn(),
    completeBackgroundJob: jest.fn(),
    rescheduleBackgroundJob: jest.fn(),
    failBackgroundJob: jest.fn(),
  }

  const handler: any = {
    supportedTypes: [BackgroundJobType.SEARCH_SYNC_PRODUCT],
    handle: jest.fn(),
  }

  let backgroundJobService: BackgroundJobService

  beforeEach(() => {
    jest.clearAllMocks()
    backgroundJobService = new BackgroundJobService(backgroundJobRepository as never, [handler] as never)
  })

  it('should complete background job when handler succeeds', async () => {
    const backgroundJob = createBackgroundJobEntity()

    backgroundJobRepository.claimBackgroundJobForProcessing.mockResolvedValue(backgroundJob)
    handler.handle.mockResolvedValue({ processed: true })

    await backgroundJobService.processBackgroundJob(JOB_ID as never, 'worker-1')

    expect(handler.handle).toHaveBeenCalledWith(backgroundJob)
    expect(backgroundJobRepository.completeBackgroundJob).toHaveBeenCalledWith(JOB_ID, { processed: true })
    expect(backgroundJobRepository.rescheduleBackgroundJob).not.toHaveBeenCalled()
    expect(backgroundJobRepository.failBackgroundJob).not.toHaveBeenCalled()
  })

  it('should reschedule background job for retryable error when attempts remain', async () => {
    const backgroundJob = createBackgroundJobEntity({
      attempts: 1,
      maxAttempts: 3,
    })

    backgroundJobRepository.claimBackgroundJobForProcessing.mockResolvedValue(backgroundJob)
    handler.handle.mockRejectedValue(new Error('Transient failure'))

    await backgroundJobService.processBackgroundJob(JOB_ID as never, 'worker-2')

    expect(backgroundJobRepository.rescheduleBackgroundJob).toHaveBeenCalledTimes(1)

    const [calledId, calledErrorPayload, calledRunAt] = backgroundJobRepository.rescheduleBackgroundJob.mock.calls[0]

    expect(calledId).toBe(JOB_ID)
    expect(calledErrorPayload).toMatchObject({
      reason: 'Transient failure',
      retryable: true,
    })
    expect(calledRunAt).toBeInstanceOf(Date)
    expect(backgroundJobRepository.failBackgroundJob).not.toHaveBeenCalled()
  })

  it('should mark background job as FAILED for non-retryable error', async () => {
    const backgroundJob = createBackgroundJobEntity({
      attempts: 0,
      maxAttempts: 3,
    })

    backgroundJobRepository.claimBackgroundJobForProcessing.mockResolvedValue(backgroundJob)
    handler.handle.mockRejectedValue(
      new NonRetryableBackgroundJobError('Unsupported payload', {
        field: 'payload',
      }),
    )

    await backgroundJobService.processBackgroundJob(JOB_ID as never, 'worker-3')

    expect(backgroundJobRepository.failBackgroundJob).toHaveBeenCalledTimes(1)

    const [calledId, calledErrorPayload] = backgroundJobRepository.failBackgroundJob.mock.calls[0]

    expect(calledId).toBe(JOB_ID)
    expect(calledErrorPayload).toMatchObject({
      reason: 'Unsupported payload',
      retryable: false,
      details: {
        field: 'payload',
      },
    })
    expect(backgroundJobRepository.rescheduleBackgroundJob).not.toHaveBeenCalled()
  })

  it('should allow owner and admin to read background job', async () => {
    const backgroundJob = createBackgroundJobEntity({
      userId: OWNER_ID,
    })

    backgroundJobRepository.findBackgroundJobById.mockResolvedValue(backgroundJob)

    const ownerResult = await backgroundJobService.getBackgroundJobById(
      JOB_ID as never,
      {
        id: OWNER_ID,
        role: UserRole.REGULAR,
      } as never,
    )

    const adminResult = await backgroundJobService.getBackgroundJobById(
      JOB_ID as never,
      {
        id: FOREIGN_USER_ID,
        role: UserRole.ADMIN,
      } as never,
    )

    expect(ownerResult.id).toBe(JOB_ID)
    expect(adminResult.id).toBe(JOB_ID)
  })

  it('should deny background job access to unrelated regular user', async () => {
    const backgroundJob = createBackgroundJobEntity({
      userId: OWNER_ID,
    })

    backgroundJobRepository.findBackgroundJobById.mockResolvedValue(backgroundJob)

    await expect(
      backgroundJobService.getBackgroundJobById(
        JOB_ID as never,
        {
          id: FOREIGN_USER_ID,
          role: UserRole.REGULAR,
        } as never,
      ),
    ).rejects.toThrow(AccessControlAuthorizationException)
  })

  it('should throw not found for unknown background job id', async () => {
    backgroundJobRepository.findBackgroundJobById.mockResolvedValue(null)

    await expect(
      backgroundJobService.getBackgroundJobById(
        JOB_ID as never,
        {
          id: OWNER_ID,
          role: UserRole.ADMIN,
        } as never,
      ),
    ).rejects.toThrow(AppEntityNotFoundException)
  })

  it('should skip processing when claim step returns null', async () => {
    backgroundJobRepository.claimBackgroundJobForProcessing.mockResolvedValue(null)

    await backgroundJobService.processBackgroundJob(JOB_ID as never, 'worker-4')

    expect(handler.handle).not.toHaveBeenCalled()
    expect(backgroundJobRepository.completeBackgroundJob).not.toHaveBeenCalled()
  })

  it('should fail retryable error when max attempts reached', async () => {
    const backgroundJob = createBackgroundJobEntity({
      attempts: 3,
      maxAttempts: 3,
    })

    backgroundJobRepository.claimBackgroundJobForProcessing.mockResolvedValue(backgroundJob)
    handler.handle.mockRejectedValue(new Error('Permanent failure'))

    await backgroundJobService.processBackgroundJob(JOB_ID as never, 'worker-5')

    expect(backgroundJobRepository.rescheduleBackgroundJob).not.toHaveBeenCalled()
    expect(backgroundJobRepository.failBackgroundJob).toHaveBeenCalledTimes(1)
  })

  it('should fail with unsupported type when no handler is registered', async () => {
    const serviceWithoutHandlers = new BackgroundJobService(backgroundJobRepository as never, [])
    const unsupportedJob = createBackgroundJobEntity({
      type: BackgroundJobType.RECIPE_IMAGE_ANALYSIS,
    })

    backgroundJobRepository.claimBackgroundJobForProcessing.mockResolvedValue(unsupportedJob)

    await serviceWithoutHandlers.processBackgroundJob(JOB_ID as never, 'worker-6')

    expect(backgroundJobRepository.failBackgroundJob).toHaveBeenCalledTimes(1)
  })
})
