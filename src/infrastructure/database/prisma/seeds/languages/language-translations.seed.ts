import { LanguageCode, PrismaClient } from '@prisma/client'
import { SeededLanguagesMap } from './type'

export async function seedLanguageTranslations(prisma: PrismaClient, languages: SeededLanguagesMap): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Seeding language translations...')

  const enLanguage = languages[LanguageCode.EN]
  const ukLanguage = languages[LanguageCode.UK]

  await Promise.all([
    // EN translated to EN: "English"
    prisma.languageTranslation.upsert({
      where: {
        languageId_translationCode: {
          languageId: enLanguage.id,
          translationCode: LanguageCode.EN,
        },
      },
      update: {
        fullLabel: 'English',
        shortLabel: 'Eng',
      },
      create: {
        languageId: enLanguage.id,
        translationCode: LanguageCode.EN,
        fullLabel: 'English',
        shortLabel: 'Eng',
      },
    }),

    // EN translated to UK: "Англійська"
    prisma.languageTranslation.upsert({
      where: {
        languageId_translationCode: {
          languageId: enLanguage.id,
          translationCode: LanguageCode.UK,
        },
      },
      update: {
        fullLabel: 'Англійська',
        shortLabel: 'Англ',
      },
      create: {
        languageId: enLanguage.id,
        translationCode: LanguageCode.UK,
        fullLabel: 'Англійська',
        shortLabel: 'Англ',
      },
    }),

    // UK translated to EN: "Ukrainian"
    prisma.languageTranslation.upsert({
      where: {
        languageId_translationCode: {
          languageId: ukLanguage.id,
          translationCode: LanguageCode.EN,
        },
      },
      update: {
        fullLabel: 'Ukrainian',
        shortLabel: 'Ukr',
      },
      create: {
        languageId: ukLanguage.id,
        translationCode: LanguageCode.EN,
        fullLabel: 'Ukrainian',
        shortLabel: 'Ukr',
      },
    }),

    // UK translated to UK: "Українська"
    prisma.languageTranslation.upsert({
      where: {
        languageId_translationCode: {
          languageId: ukLanguage.id,
          translationCode: LanguageCode.UK,
        },
      },
      update: {
        fullLabel: 'Українська',
        shortLabel: 'Укр',
      },
      create: {
        languageId: ukLanguage.id,
        translationCode: LanguageCode.UK,
        fullLabel: 'Українська',
        shortLabel: 'Укр',
      },
    }),
  ])

  // eslint-disable-next-line no-console
  console.log('Language translations seeded ✅')
}
