import { Injectable } from '@nestjs/common'
import { Language, LanguageCode } from '@prisma/client'
import { match } from 'ts-pattern'
import { Nullable, Uuid } from '@common/type'
import { isLanguageCode, isUuid } from '@common/util'
import { LanguageApiModel } from '../api-model'
import { LanguageRepository } from '../repository'

@Injectable()
export class LanguageService {
  private cachedDefaultLanguage: Language | null = null

  public constructor(private readonly languageRepository: LanguageRepository) {}

  public async getAllLanguages(languageCode: LanguageCode): Promise<LanguageApiModel[]> {
    const languages = await this.languageRepository.findAllLanguages(languageCode)

    const normalizedLanguages = languages.map(({ translations, defaultLocale, ...language }) => {
      const [currentTranslation] = translations
      const { fullLabel, shortLabel } = currentTranslation

      return {
        ...language,
        locale: defaultLocale as string,
        fullLabel,
        shortLabel,
      }
    })

    return LanguageApiModel.fromList(normalizedLanguages)
  }

  public async getLanguageById(id: Uuid): Promise<Language | null> {
    return this.languageRepository.findLanguageById(id)
  }

  public async getLanguageByCode(code: LanguageCode): Promise<Language | null> {
    return this.languageRepository.findLanguageByCode(code)
  }

  public async getDefaultLanguage(): Promise<Language> {
    if (this.cachedDefaultLanguage) {
      return this.cachedDefaultLanguage
    }

    const defaultLanguage = await this.languageRepository.findDefaultLanguage()
    this.cachedDefaultLanguage = defaultLanguage
    return defaultLanguage
  }

  public async getLanguageOrDefault(idOrCode: Nullable<Uuid | LanguageCode>): Promise<Language> {
    const defaultLanguageCode = await this.getDefaultLanguage()

    if (!idOrCode) {
      return defaultLanguageCode
    }

    const language = await match(idOrCode)
      .when(isUuid, async () => await this.getLanguageById(idOrCode))
      .when(isLanguageCode, async () => await this.getLanguageByCode(idOrCode as LanguageCode))
      .otherwise(() => defaultLanguageCode)

    return language ?? defaultLanguageCode
  }

  public async setDefaultLanguage(languageId: Uuid): Promise<void> {
    const updatedLanguage = await this.languageRepository.setDefaultLanguage(languageId)

    if (updatedLanguage.id !== languageId) {
      this.cachedDefaultLanguage = updatedLanguage
    }
  }
}
