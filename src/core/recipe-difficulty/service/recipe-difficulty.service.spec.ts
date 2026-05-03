import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { LanguageCode, RecipeDifficultyKey } from '@prisma/client'
import { RecipeDifficultyService } from './recipe-difficulty.service'

const LANGUAGE_EN_ID = '11111111-1111-4111-8111-111111111111'

describe('RecipeDifficultyService', () => {
  const recipeDifficultyRepository: any = {
    findAllRecipeDifficulties: jest.fn(),
    findRecipeDifficultyByKey: jest.fn(),
  }

  const languageService: any = {
    getLanguageOrDefault: jest.fn(),
  }

  let service: RecipeDifficultyService

  beforeEach(() => {
    jest.clearAllMocks()

    languageService.getLanguageOrDefault.mockResolvedValue({
      id: LANGUAGE_EN_ID,
      code: LanguageCode.EN,
    })

    service = new RecipeDifficultyService(recipeDifficultyRepository, languageService)
  })

  it('should return mapped difficulties list with labels', async () => {
    recipeDifficultyRepository.findAllRecipeDifficulties.mockResolvedValue([
      {
        key: RecipeDifficultyKey.MEDIUM,
        translations: [{ label: 'Medium' }],
      },
    ])

    const result = await service.getAllRecipeDifficulties(LanguageCode.EN)

    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Medium')
  })

  it('should delegate get by key', async () => {
    const difficulty = { key: RecipeDifficultyKey.HARD }
    recipeDifficultyRepository.findRecipeDifficultyByKey.mockResolvedValue(difficulty)

    expect(await service.getRecipeDifficultyByKey(RecipeDifficultyKey.HARD)).toEqual(difficulty)
  })
})
