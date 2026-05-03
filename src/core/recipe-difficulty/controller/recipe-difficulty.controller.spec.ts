import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { RecipeDifficultyController } from './recipe-difficulty.controller'

describe('RecipeDifficultyController', () => {
  const recipeDifficultyService: any = {
    getAllRecipeDifficulties: jest.fn(),
  }

  let controller: RecipeDifficultyController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new RecipeDifficultyController(recipeDifficultyService)
  })

  it('should delegate getRecipeDifficultyList', async () => {
    recipeDifficultyService.getAllRecipeDifficulties.mockResolvedValue([{ key: 'MEDIUM' }])

    const result = await controller.getRecipeDifficultyList('EN' as never)

    expect(result).toEqual([{ key: 'MEDIUM' }])
    expect(recipeDifficultyService.getAllRecipeDifficulties).toHaveBeenCalledWith('EN')
  })
})
