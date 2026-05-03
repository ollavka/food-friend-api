import { Inject, Injectable } from '@nestjs/common'
import { BackgroundJob, BackgroundJobType, Prisma, User, UserRole } from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { AppEntityNotFoundException } from '@common/exception'
import { Uuid } from '@common/type'
import { BackgroundJobApiModel } from '../api-model'
import { BACKGROUND_JOB_HANDLERS_TOKEN } from '../constant'
import { BackgroundJobRepository } from '../repository'
import { BackgroundJobDetails, BackgroundJobHandler, NonRetryableBackgroundJobError } from '../type'

@Injectable()
export class BackgroundJobService {
  private readonly handlersByType: Map<BackgroundJobType, BackgroundJobHandler>

  public constructor(
    private readonly backgroundJobRepository: BackgroundJobRepository,
    @Inject(BACKGROUND_JOB_HANDLERS_TOKEN) handlers: BackgroundJobHandler[],
  ) {
    this.handlersByType = this.prepareHandlersByType(handlers)
  }

  public async getBackgroundJobById(id: Uuid, user: User): Promise<BackgroundJobApiModel> {
    const backgroundJob = await this.backgroundJobRepository.findBackgroundJobById(id)

    if (!backgroundJob) {
      throw AppEntityNotFoundException.byId('BackgroundJob', id)
    }

    this.enforceBackgroundJobAccess(backgroundJob.userId, user)

    return BackgroundJobApiModel.from(this.mapBackgroundJob(backgroundJob))
  }

  public async getPendingBackgroundJobIdsForDispatch(limit = 100): Promise<Uuid[]> {
    return this.backgroundJobRepository.findPendingBackgroundJobIds(limit, new Date())
  }

  public async processBackgroundJob(backgroundJobId: Uuid, workerId: string): Promise<void> {
    const claimedJob = await this.backgroundJobRepository.claimBackgroundJobForProcessing(
      backgroundJobId,
      workerId,
      this.getLockExpirationDate(),
    )

    if (!claimedJob) {
      return
    }

    try {
      const handler = this.resolveHandlerByJobType(claimedJob.type)
      const result = await handler.handle(claimedJob)
      await this.backgroundJobRepository.completeBackgroundJob(backgroundJobId, <Prisma.InputJsonValue>result)
    } catch (error) {
      const isNonRetryable = error instanceof NonRetryableBackgroundJobError
      const shouldRetry = !isNonRetryable && claimedJob.attempts < claimedJob.maxAttempts
      const errorPayload = this.serializeError(error)

      if (shouldRetry) {
        const runAt = this.getRetryRunAt(claimedJob.attempts)
        await this.backgroundJobRepository.rescheduleBackgroundJob(
          backgroundJobId,
          <Prisma.InputJsonValue>errorPayload,
          runAt,
        )
        return
      }

      await this.backgroundJobRepository.failBackgroundJob(backgroundJobId, <Prisma.InputJsonValue>errorPayload)
    }
  }

  private prepareHandlersByType(handlers: BackgroundJobHandler[]): Map<BackgroundJobType, BackgroundJobHandler> {
    const handlersByType = new Map<BackgroundJobType, BackgroundJobHandler>()

    for (const handler of handlers) {
      for (const supportedType of handler.supportedTypes) {
        handlersByType.set(supportedType, handler)
      }
    }

    return handlersByType
  }

  private resolveHandlerByJobType(type: BackgroundJobType): BackgroundJobHandler {
    const handler = this.handlersByType.get(type)

    if (handler) {
      return handler
    }

    throw new NonRetryableBackgroundJobError('Background job type is not supported in this step.', { type })
  }

  private mapBackgroundJob(backgroundJob: BackgroundJob): BackgroundJobDetails {
    return {
      id: <Uuid>backgroundJob.id,
      type: backgroundJob.type,
      status: backgroundJob.status,
      attempts: backgroundJob.attempts,
      maxAttempts: backgroundJob.maxAttempts,
      runAt: backgroundJob.runAt,
      startedAt: backgroundJob.startedAt,
      finishedAt: backgroundJob.finishedAt,
      result: backgroundJob.result,
      error: backgroundJob.error,
      createdAt: backgroundJob.createdAt,
      updatedAt: backgroundJob.updatedAt,
    }
  }

  private serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof NonRetryableBackgroundJobError) {
      return {
        reason: error.message,
        retryable: false,
        details: error.details ?? null,
      }
    }

    if (error instanceof Error) {
      return {
        reason: error.message,
        retryable: true,
      }
    }

    return {
      reason: 'Unknown background job processing error.',
      retryable: true,
    }
  }

  private getRetryRunAt(attempts: number): Date {
    const baseDelayMs = 15_000
    const maxDelayMs = 15 * 60 * 1000
    const delayMs = Math.min(maxDelayMs, baseDelayMs * 2 ** Math.max(0, attempts - 1))
    return new Date(Date.now() + delayMs)
  }

  private getLockExpirationDate(): Date {
    return new Date(Date.now() + 5 * 60 * 1000)
  }

  private enforceBackgroundJobAccess(ownerId: Uuid | null, user: User): void {
    if (user.role === UserRole.ADMIN) {
      return
    }

    if (ownerId && ownerId === user.id) {
      return
    }

    throw new AccessControlAuthorizationException('forbidden', 'Access denied. Please contact support.')
  }
}
