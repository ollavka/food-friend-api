import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { LanguageCode } from '@prisma/client'
import { LanguageService } from './language.service'

const LANGUAGE_EN_ID = '11111111-1111-4111-8111-111111111111'
const LANGUAGE_UK_ID = '22222222-2222-4222-8222-222222222222'

describe('LanguageService', () => {
  const languageRepository: any = {
    findAllLanguages: jest.fn(),
    findLanguageById: jest.fn(),
    findLanguageByCode: jest.fn(),
    findDefaultLanguage: jest.fn(),
    setDefaultLanguage: jest.fn(),
  }

  let service: LanguageService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new LanguageService(languageRepository)

    languageRepository.findDefaultLanguage.mockResolvedValue({
      id: LANGUAGE_EN_ID,
      code: LanguageCode.EN,
      defaultLocale: 'en_US',
    })
  })

  it('should map language list with translation labels', async () => {
    languageRepository.findAllLanguages.mockResolvedValue([
      {
        id: LANGUAGE_EN_ID,
        code: LanguageCode.EN,
        defaultLocale: 'en_US',
        translations: [{ fullLabel: 'English', shortLabel: 'Eng' }],
      },
    ])

    const result = await service.getAllLanguages(LanguageCode.EN)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      code: LanguageCode.EN,
      locale: 'en_US',
      fullLabel: 'English',
      shortLabel: 'Eng',
    })
  })

  it('should cache default language', async () => {
    const first = await service.getDefaultLanguage()
    const second = await service.getDefaultLanguage()

    expect(first.code).toBe(LanguageCode.EN)
    expect(second.code).toBe(LanguageCode.EN)
    expect(languageRepository.findDefaultLanguage).toHaveBeenCalledTimes(1)
  })

  it('should resolve language by uuid/code and fallback to default', async () => {
    languageRepository.findLanguageById.mockResolvedValue({ id: LANGUAGE_UK_ID, code: LanguageCode.UK })
    languageRepository.findLanguageByCode.mockResolvedValue({ id: LANGUAGE_UK_ID, code: LanguageCode.UK })

    const byId = await service.getLanguageOrDefault(LANGUAGE_UK_ID)
    const byCode = await service.getLanguageOrDefault(LanguageCode.UK)
    const fallback = await service.getLanguageOrDefault('invalid' as never)

    expect(byId.code).toBe(LanguageCode.UK)
    expect(byCode.code).toBe(LanguageCode.UK)
    expect(fallback.code).toBe(LanguageCode.EN)
  })

  it('should keep cached default when setDefaultLanguage receives same id', async () => {
    await service.getDefaultLanguage()

    languageRepository.setDefaultLanguage.mockResolvedValue({ id: LANGUAGE_EN_ID, code: LanguageCode.EN })
    await service.setDefaultLanguage(LANGUAGE_EN_ID)

    const cached = await service.getDefaultLanguage()
    expect(cached.id).toBe(LANGUAGE_EN_ID)
    expect(languageRepository.findDefaultLanguage).toHaveBeenCalledTimes(1)
  })
})
