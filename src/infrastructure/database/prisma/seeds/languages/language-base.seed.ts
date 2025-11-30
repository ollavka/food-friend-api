import { Language, LanguageCode, PrismaClient } from '@prisma/client'

export type SeededLanguagesMap = Record<LanguageCode, Language>

export async function seedLanguageBase(prisma: PrismaClient): Promise<SeededLanguagesMap> {
  // eslint-disable-next-line no-console
  console.log('Seeding base languages...')

  const enLanguage = await prisma.language.upsert({
    where: { code: LanguageCode.EN },
    update: {
      defaultLocale: 'en_US',
      isDefault: false,
    },
    create: {
      code: LanguageCode.EN,
      defaultLocale: 'en_US',
      isDefault: false,
    },
  })

  const ukLanguage = await prisma.language.upsert({
    where: { code: LanguageCode.UK },
    update: {
      defaultLocale: 'uk_UA',
      isDefault: true,
    },
    create: {
      code: LanguageCode.UK,
      defaultLocale: 'uk_UA',
      isDefault: true,
    },
  })

  // eslint-disable-next-line no-console
  console.log('Base languages seeded ✅')

  return {
    [LanguageCode.EN]: enLanguage,
    [LanguageCode.UK]: ukLanguage,
  }
}
