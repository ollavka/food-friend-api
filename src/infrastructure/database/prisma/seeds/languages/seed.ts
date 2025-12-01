import { PrismaClient } from '@prisma/client'
import { seedLanguageBase } from './language-base.seed'
import { seedLanguageTranslations } from './language-translations.seed'
import { SeededLanguagesMap } from './type'

export async function seedLanguages(prisma: PrismaClient): Promise<SeededLanguagesMap> {
  const languages = await seedLanguageBase(prisma)
  await seedLanguageTranslations(prisma, languages)
  return languages
}
