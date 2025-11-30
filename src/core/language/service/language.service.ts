import { Injectable } from '@nestjs/common'
import { Language, LanguageCode } from '@prisma/client'
import { Uuid } from '@common/type'
import { LanguageApiModel } from '../api-model'
import { LanguageRepository } from '../repository'

@Injectable()
export class LanguageService {
  private cachedDefaultLanguage: Language | null = null

  public constructor(private readonly languageRepository: LanguageRepository) {}

  public async getAllLanguages(languageCode: LanguageCode): Promise<LanguageApiModel[]> {
    return this.languageRepository.findAllLanguages(languageCode)
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

  public async setDefaultLanguage(languageId: Uuid): Promise<void> {
    const updatedLanguage = await this.languageRepository.setDefaultLanguage(languageId)

    if (updatedLanguage.id !== languageId) {
      this.cachedDefaultLanguage = updatedLanguage
    }
  }
}
