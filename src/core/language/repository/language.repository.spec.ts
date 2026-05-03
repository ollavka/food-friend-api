import { describe, expect, it, jest } from '@jest/globals'
import { LanguageCode } from '@prisma/client'
import { LanguageRepository } from './language.repository'

describe('LanguageRepository', () => {
  const createRepository = (): { repository: LanguageRepository; prismaService: any } => {
    const prismaService: any = {
      language: {
        findFirstOrThrow: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    }

    const repository = new LanguageRepository(prismaService as any)
    return { repository, prismaService }
  }

  it('should find default language', async () => {
    const { repository, prismaService } = createRepository()
    const language = { id: 'lang-id', isDefault: true }
    prismaService.language.findFirstOrThrow.mockResolvedValue(language)

    const result = await repository.findDefaultLanguage()
    expect(result).toEqual(language)
    expect(prismaService.language.findFirstOrThrow).toHaveBeenCalledWith({ where: { isDefault: true } })
  })

  it('should return current default language when requested language is already default', async () => {
    const { repository, prismaService } = createRepository()
    const currentDefaultLanguage = { id: 'lang-id', isDefault: true }
    prismaService.language.findFirst.mockResolvedValue(currentDefaultLanguage)

    const result = await repository.setDefaultLanguage('lang-id' as any)

    expect(result).toEqual(currentDefaultLanguage)
    expect(prismaService.language.update).not.toHaveBeenCalled()
  })

  it('should switch default language when another default exists', async () => {
    const { repository, prismaService } = createRepository()
    prismaService.language.findFirst.mockResolvedValue({ id: 'current-default-id', isDefault: true })
    prismaService.language.update
      .mockResolvedValueOnce({ id: 'current-default-id', isDefault: false })
      .mockResolvedValueOnce({ id: 'new-default-id', isDefault: true })

    const result = await repository.setDefaultLanguage('new-default-id' as any)

    expect(prismaService.language.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'current-default-id' },
      data: { isDefault: false },
    })
    expect(prismaService.language.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'new-default-id' },
      data: { isDefault: true },
    })
    expect(result).toEqual({ id: 'new-default-id', isDefault: true })
  })

  it('should set default language when there is no current default', async () => {
    const { repository, prismaService } = createRepository()
    prismaService.language.findFirst.mockResolvedValue(null)
    prismaService.language.update.mockResolvedValue({ id: 'new-default-id', isDefault: true })

    const result = await repository.setDefaultLanguage('new-default-id' as any)

    expect(prismaService.language.update).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ id: 'new-default-id', isDefault: true })
  })

  it('should query languages and language by id/code', async () => {
    const { repository, prismaService } = createRepository()
    prismaService.language.findMany.mockResolvedValue([])
    prismaService.language.findUnique.mockResolvedValue(null)

    await repository.findAllLanguages(LanguageCode.EN)
    await repository.findLanguageById('lang-id' as any)
    await repository.findLanguageByCode(LanguageCode.UK)

    expect(prismaService.language.findMany).toHaveBeenCalledWith({
      include: {
        translations: {
          where: { translationCode: LanguageCode.EN },
        },
      },
    })
    expect(prismaService.language.findUnique).toHaveBeenNthCalledWith(1, { where: { id: 'lang-id' } })
    expect(prismaService.language.findUnique).toHaveBeenNthCalledWith(2, { where: { code: LanguageCode.UK } })
  })
})
