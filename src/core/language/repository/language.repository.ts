import { Injectable } from '@nestjs/common'
import { Language, LanguageCode } from '@prisma/client'
import { Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'
import { LanguageApiModel } from '../api-model'

@Injectable()
export class LanguageRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findDefaultLanguage(): Promise<Language> {
    return this.prismaService.language.findFirstOrThrow({
      where: {
        isDefault: true,
      },
    })
  }

  public async setDefaultLanguage(languageId: Uuid): Promise<Language> {
    const currentDefaultLanguage = await this.prismaService.language.findFirst({
      where: {
        isDefault: true,
      },
    })

    if (currentDefaultLanguage?.id === languageId) {
      return currentDefaultLanguage
    }

    if (currentDefaultLanguage) {
      await this.prismaService.language.update({
        where: {
          id: currentDefaultLanguage.id,
        },
        data: {
          isDefault: false,
        },
      })
    }

    return this.prismaService.language.update({
      where: {
        id: languageId,
      },
      data: {
        isDefault: true,
      },
    })
  }

  public async findAllLanguages(languageCode: LanguageCode): Promise<LanguageApiModel[]> {
    const languages = await this.prismaService.language.findMany({
      include: {
        translations: {
          where: {
            translationCode: languageCode,
          },
        },
      },
    })

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

  public async findLanguageById(id: Uuid): Promise<Language | null> {
    return this.prismaService.language.findUnique({
      where: {
        id,
      },
    })
  }

  public async findLanguageByCode(code: LanguageCode): Promise<Language | null> {
    return this.prismaService.language.findUnique({
      where: {
        code,
      },
    })
  }
}
