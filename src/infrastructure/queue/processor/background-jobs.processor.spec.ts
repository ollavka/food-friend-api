import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BackgroundJobsProcessor } from './background-jobs.processor'

describe('BackgroundJobsProcessor', () => {
  const backgroundJobService: any = {
    processBackgroundJob: jest.fn(),
  }

  let processor: BackgroundJobsProcessor

  beforeEach(() => {
    jest.clearAllMocks()
    processor = new BackgroundJobsProcessor(backgroundJobService)
  })

  it('should skip processing when background job id is invalid', async () => {
    await processor.process({ id: 'invalid', data: {} } as never)

    expect(backgroundJobService.processBackgroundJob).not.toHaveBeenCalled()
  })

  it('should process valid background job id from job id', async () => {
    await processor.process({ id: '11111111-1111-4111-8111-111111111111', data: {} } as never)

    expect(backgroundJobService.processBackgroundJob).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      expect.stringContaining('queue-worker-'),
    )
  })

  it('should process valid background job id from job data', async () => {
    await processor.process({
      id: 'not-uuid',
      data: { backgroundJobId: '22222222-2222-4222-8222-222222222222' },
    } as never)

    expect(backgroundJobService.processBackgroundJob).toHaveBeenCalledWith(
      '22222222-2222-4222-8222-222222222222',
      expect.stringContaining('queue-worker-'),
    )
  })
})
