import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { DispatchBackgroundJobsJob } from './dispatch-background-jobs.job'

describe('DispatchBackgroundJobsJob', () => {
  const queue: any = {
    add: jest.fn(),
  }

  const backgroundJobService: any = {
    getPendingBackgroundJobIdsForDispatch: jest.fn(),
  }

  let job: DispatchBackgroundJobsJob

  beforeEach(() => {
    jest.clearAllMocks()
    job = new DispatchBackgroundJobsJob(queue, backgroundJobService)
  })

  it('should skip queue when there are no pending jobs', async () => {
    backgroundJobService.getPendingBackgroundJobIdsForDispatch.mockResolvedValue([])

    await job.handle()

    expect(queue.add).not.toHaveBeenCalled()
  })

  it('should enqueue every pending background job', async () => {
    backgroundJobService.getPendingBackgroundJobIdsForDispatch.mockResolvedValue([
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
    ])

    await job.handle()

    expect(queue.add).toHaveBeenCalledTimes(2)
    expect(queue.add).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      { backgroundJobId: '11111111-1111-4111-8111-111111111111' },
      expect.objectContaining({ jobId: '11111111-1111-4111-8111-111111111111' }),
    )
  })

  it('should ignore duplicated queue job errors', async () => {
    backgroundJobService.getPendingBackgroundJobIdsForDispatch.mockResolvedValue([
      '11111111-1111-4111-8111-111111111111',
    ])

    queue.add.mockRejectedValue(new Error('Job is already waiting'))

    await expect(job.handle()).resolves.toBeUndefined()
  })
})
