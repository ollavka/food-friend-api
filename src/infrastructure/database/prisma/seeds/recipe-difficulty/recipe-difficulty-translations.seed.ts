import { LanguageCode, PrismaClient, RecipeDifficultyKey } from '@prisma/client'
import { SeededLanguagesMap } from '../languages/type'
import { SeededRecipeDifficultyMap } from './type'

export async function seedRecipeDifficultyTranslations(
  prisma: PrismaClient,
  difficulties: SeededRecipeDifficultyMap,
  languages: SeededLanguagesMap,
): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Seeding recipe difficulty translations...')

  const easyDifficulty = difficulties[RecipeDifficultyKey.EASY]
  const mediumDifficulty = difficulties[RecipeDifficultyKey.MEDIUM]
  const hardDifficulty = difficulties[RecipeDifficultyKey.HARD]

  const enLanguage = languages[LanguageCode.EN]
  const ukLanguage = languages[LanguageCode.UK]

  await Promise.all([
    // EASY translated
    prisma.recipeDifficultyTranslation.upsert({
      where: {
        difficultyId_languageId: {
          difficultyId: easyDifficulty.id,
          languageId: enLanguage.id,
        },
      },
      create: {
        difficultyId: easyDifficulty.id,
        languageId: enLanguage.id,
        label: 'Easy',
      },
      update: {
        difficultyId: easyDifficulty.id,
        languageId: enLanguage.id,
        label: 'Easy',
      },
    }),
    prisma.recipeDifficultyTranslation.upsert({
      where: {
        difficultyId_languageId: {
          difficultyId: easyDifficulty.id,
          languageId: ukLanguage.id,
        },
      },
      create: {
        difficultyId: easyDifficulty.id,
        languageId: ukLanguage.id,
        label: 'Легко',
      },
      update: {
        difficultyId: easyDifficulty.id,
        languageId: ukLanguage.id,
        label: 'Легко',
      },
    }),

    // MEDIUM translated
    prisma.recipeDifficultyTranslation.upsert({
      where: {
        difficultyId_languageId: {
          difficultyId: mediumDifficulty.id,
          languageId: enLanguage.id,
        },
      },
      create: {
        difficultyId: mediumDifficulty.id,
        languageId: enLanguage.id,
        label: 'Medium',
      },
      update: {
        difficultyId: mediumDifficulty.id,
        languageId: enLanguage.id,
        label: 'Medium',
      },
    }),
    prisma.recipeDifficultyTranslation.upsert({
      where: {
        difficultyId_languageId: {
          difficultyId: mediumDifficulty.id,
          languageId: ukLanguage.id,
        },
      },
      create: {
        difficultyId: mediumDifficulty.id,
        languageId: ukLanguage.id,
        label: 'Середньо',
      },
      update: {
        difficultyId: mediumDifficulty.id,
        languageId: ukLanguage.id,
        label: 'Середньо',
      },
    }),

    // HARD translated
    prisma.recipeDifficultyTranslation.upsert({
      where: {
        difficultyId_languageId: {
          difficultyId: hardDifficulty.id,
          languageId: enLanguage.id,
        },
      },
      create: {
        difficultyId: hardDifficulty.id,
        languageId: enLanguage.id,
        label: 'Hard',
      },
      update: {
        difficultyId: hardDifficulty.id,
        languageId: enLanguage.id,
        label: 'Hard',
      },
    }),
    prisma.recipeDifficultyTranslation.upsert({
      where: {
        difficultyId_languageId: {
          difficultyId: hardDifficulty.id,
          languageId: ukLanguage.id,
        },
      },
      create: {
        difficultyId: hardDifficulty.id,
        languageId: ukLanguage.id,
        label: 'Складно',
      },
      update: {
        difficultyId: hardDifficulty.id,
        languageId: ukLanguage.id,
        label: 'Складно',
      },
    }),
  ])

  // eslint-disable-next-line no-console
  console.log('Recipe difficulty translations seeded ✅')
}
