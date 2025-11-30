import { PrismaClient } from '@prisma/client'
import { seedLanguageBase } from './language-base.seed'
import { seedLanguageTranslations } from './language-translations.seed'

export async function seedLanguages(prisma: PrismaClient): Promise<void> {
  const languages = await seedLanguageBase(prisma)
  await seedLanguageTranslations(prisma, languages)
}
