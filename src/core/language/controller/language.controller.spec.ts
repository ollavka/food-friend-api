import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { LanguageController } from './language.controller'

describe('LanguageController', () => {
  const languageService: any = {
    getAllLanguages: jest.fn(),
    setDefaultLanguage: jest.fn(),
  }

  let controller: LanguageController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new LanguageController(languageService)
  })

  it('should delegate getLanguageList', async () => {
    languageService.getAllLanguages.mockResolvedValue([{ code: 'EN' }])

    const result = await controller.getLanguageList('EN' as never)

    expect(result).toEqual([{ code: 'EN' }])
    expect(languageService.getAllLanguages).toHaveBeenCalledWith('EN')
  })

  it('should set default language', async () => {
    languageService.setDefaultLanguage.mockResolvedValue(undefined)

    const result = await controller.setDefaultLanguage({ id: 'lang-1' } as never)

    expect(result).toBe(true)
    expect(languageService.setDefaultLanguage).toHaveBeenCalledWith('lang-1')
  })
})
