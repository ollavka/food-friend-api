import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { Queue } from 'bullmq'
import { Uuid } from '@common/type'
import { BackgroundJobService } from '@core/background-job'
import { BACKGROUND_JOBS_QUEUE_JOB_NAME, BACKGROUND_JOBS_QUEUE_NAME } from '../constant'

@Injectable()
export class DispatchBackgroundJobsJob {
  private readonly logger = new Logger(DispatchBackgroundJobsJob.name)

  public constructor(
    @InjectQueue(BACKGROUND_JOBS_QUEUE_NAME) private readonly queue: Queue,
    private readonly backgroundJobService: BackgroundJobService,
  ) {}

  @Cron('*/5 * * * * *', { name: 'dispatch-background-jobs', timeZone: 'Europe/Kyiv' })
  public async handle(): Promise<void> {
    const pendingJobIds = await this.backgroundJobService.getPendingBackgroundJobIdsForDispatch(200)

    if (pendingJobIds.length === 0) {
      return
    }

    for (const backgroundJobId of pendingJobIds) {
      await this.enqueueBackgroundJob(backgroundJobId)
    }
  }

  private async enqueueBackgroundJob(backgroundJobId: Uuid): Promise<void> {
    try {
      await this.queue.add(
        BACKGROUND_JOBS_QUEUE_JOB_NAME,
        { backgroundJobId },
        {
          jobId: backgroundJobId,
          removeOnComplete: true,
          removeOnFail: true,
        },
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : ''

      if (this.isDuplicatedQueueJobError(message)) {
        return
      }

      this.logger.error(`Failed to enqueue background job "${backgroundJobId}": ${message}`)
    }
  }

  private isDuplicatedQueueJobError(message: string): boolean {
    return (
      message.includes('Job is already waiting') ||
      message.includes('Job is already active') ||
      message.includes('Job is already delayed')
    )
  }
}
