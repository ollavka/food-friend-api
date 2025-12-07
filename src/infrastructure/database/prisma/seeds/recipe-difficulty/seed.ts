import { PrismaClient } from '@prisma/client'
import { SeededLanguagesMap } from '../languages/type'
import { seedRecipeDifficultiesBase } from './recipe-difficulty-base.seed'
import { seedRecipeDifficultyTranslations } from './recipe-difficulty-translations.seed'
import { SeededRecipeDifficultyMap } from './type'

export async function seedRecipeDifficulties(
  prisma: PrismaClient,
  languages: SeededLanguagesMap,
): Promise<SeededRecipeDifficultyMap> {
  const difficulties = await seedRecipeDifficultiesBase(prisma)
  await seedRecipeDifficultyTranslations(prisma, difficulties, languages)
  return difficulties
}
