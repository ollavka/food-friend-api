import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { isUuid } from '@common/util'
import { BackgroundJobService } from '@core/background-job'
import { BACKGROUND_JOBS_QUEUE_NAME } from '../constant'

@Injectable()
@Processor(BACKGROUND_JOBS_QUEUE_NAME, { concurrency: 5 })
export class BackgroundJobsProcessor extends WorkerHost {
  private readonly logger = new Logger(BackgroundJobsProcessor.name)

  public constructor(private readonly backgroundJobService: BackgroundJobService) {
    super()
  }

  public async process(job: Job<{ backgroundJobId?: string }>): Promise<void> {
    const backgroundJobId = this.extractBackgroundJobId(job)

    if (!backgroundJobId) {
      this.logger.warn(`Skip queue job with invalid background job id: ${job.id ?? 'unknown'}`)
      return
    }

    await this.backgroundJobService.processBackgroundJob(backgroundJobId, `queue-worker-${process.pid}`)
  }

  private extractBackgroundJobId(job: Job<{ backgroundJobId?: string }>): string | null {
    if (typeof job.id === 'string' && isUuid(job.id)) {
      return job.id
    }

    const dataId = job.data?.backgroundJobId
    return isUuid(dataId) ? dataId : null
  }
}
