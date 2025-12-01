import { LanguageCode, MeasurementBaseTypeKey, PrismaClient } from '@prisma/client'
import { SeededLanguagesMap } from '../languages/type'
import { SeededMeasurementBaseTypeMap } from './type'

export async function seedMeasurementBaseTypeTranslations(
  prisma: PrismaClient,
  baseTypes: SeededMeasurementBaseTypeMap,
  languages: SeededLanguagesMap,
): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Seeding measurement base type translations...')

  const massBaseType = baseTypes[MeasurementBaseTypeKey.MASS]
  const volumeBaseType = baseTypes[MeasurementBaseTypeKey.VOLUME]
  const countBaseType = baseTypes[MeasurementBaseTypeKey.COUNT]

  const enLanguage = languages[LanguageCode.EN]
  const ukLanguage = languages[LanguageCode.UK]

  await Promise.all([
    // MASS translated to EN
    prisma.measurementBaseTypeTranslation.upsert({
      where: {
        baseTypeId_languageId: {
          baseTypeId: massBaseType.id,
          languageId: enLanguage.id,
        },
      },
      create: {
        languageId: enLanguage.id,
        baseTypeId: massBaseType.id,
        label: 'Mass',
      },
      update: {
        languageId: enLanguage.id,
        baseTypeId: massBaseType.id,
        label: 'Mass',
      },
    }),

    // MASS translated to UK
    prisma.measurementBaseTypeTranslation.upsert({
      where: {
        baseTypeId_languageId: {
          baseTypeId: massBaseType.id,
          languageId: ukLanguage.id,
        },
      },
      create: {
        languageId: ukLanguage.id,
        baseTypeId: massBaseType.id,
        label: 'Маса',
      },
      update: {
        languageId: ukLanguage.id,
        baseTypeId: massBaseType.id,
        label: 'Маса',
      },
    }),

    // VOLUME translated to EN
    prisma.measurementBaseTypeTranslation.upsert({
      where: {
        baseTypeId_languageId: {
          baseTypeId: volumeBaseType.id,
          languageId: enLanguage.id,
        },
      },
      create: {
        languageId: enLanguage.id,
        baseTypeId: volumeBaseType.id,
        label: 'Volume',
      },
      update: {
        languageId: enLanguage.id,
        baseTypeId: volumeBaseType.id,
        label: 'Volume',
      },
    }),

    // VOLUME translated to UK
    prisma.measurementBaseTypeTranslation.upsert({
      where: {
        baseTypeId_languageId: {
          baseTypeId: volumeBaseType.id,
          languageId: ukLanguage.id,
        },
      },
      create: {
        languageId: ukLanguage.id,
        baseTypeId: volumeBaseType.id,
        label: 'Об’єм',
      },
      update: {
        languageId: ukLanguage.id,
        baseTypeId: volumeBaseType.id,
        label: 'Об’єм',
      },
    }),

    // COUNT translated to EN
    prisma.measurementBaseTypeTranslation.upsert({
      where: {
        baseTypeId_languageId: {
          baseTypeId: countBaseType.id,
          languageId: enLanguage.id,
        },
      },
      create: {
        languageId: enLanguage.id,
        baseTypeId: countBaseType.id,
        label: 'Count',
      },
      update: {
        languageId: enLanguage.id,
        baseTypeId: countBaseType.id,
        label: 'Count',
      },
    }),

    // COUNT translated to UK
    prisma.measurementBaseTypeTranslation.upsert({
      where: {
        baseTypeId_languageId: {
          baseTypeId: countBaseType.id,
          languageId: ukLanguage.id,
        },
      },
      create: {
        languageId: ukLanguage.id,
        baseTypeId: countBaseType.id,
        label: 'Кількість',
      },
      update: {
        languageId: ukLanguage.id,
        baseTypeId: countBaseType.id,
        label: 'Кількість',
      },
    }),
  ])

  // eslint-disable-next-line no-console
  console.log('Measurement base type translations seeded ✅')
}
