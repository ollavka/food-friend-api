import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BackgroundJobController } from './background-job.controller'

describe('BackgroundJobController', () => {
  const backgroundJobService: any = {
    getBackgroundJobById: jest.fn(),
  }

  let controller: BackgroundJobController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new BackgroundJobController(backgroundJobService)
  })

  it('should delegate getBackgroundJobById', async () => {
    const user = { id: 'user-1' }
    const expected = { id: 'job-1' }

    backgroundJobService.getBackgroundJobById.mockResolvedValue(expected)

    const result = await controller.getBackgroundJobById('job-1' as never, user as never)

    expect(result).toEqual(expected)
    expect(backgroundJobService.getBackgroundJobById).toHaveBeenCalledWith('job-1', user)
  })
})
