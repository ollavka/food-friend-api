import { LanguageCode, MeasurementUnitKey, PrismaClient } from '@prisma/client'
import { SeededLanguagesMap } from '../languages/type'
import { SeededMeasurementUnitMap } from './type'

export async function seedMeasurementUnitTranslations(
  prisma: PrismaClient,
  units: SeededMeasurementUnitMap,
  languages: SeededLanguagesMap,
): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Seeding measurement unit translations...')

  const gUnit = units[MeasurementUnitKey.G]
  const kgUnit = units[MeasurementUnitKey.KG]
  const mlUnit = units[MeasurementUnitKey.ML]
  const lUnit = units[MeasurementUnitKey.L]
  const pcUnit = units[MeasurementUnitKey.PC]

  const enLanguage = languages[LanguageCode.EN]
  const ukLanguage = languages[LanguageCode.UK]

  await Promise.all([
    // G translated to EN
    prisma.measurementUnitTranslation.upsert({
      where: {
        unitId_languageId: {
          unitId: gUnit.id,
          languageId: enLanguage.id,
        },
      },
      create: {
        languageId: enLanguage.id,
        unitId: gUnit.id,
        label: 'g',
      },
      update: {
        languageId: enLanguage.id,
        unitId: gUnit.id,
        label: 'g',
      },
    }),

    // G translated to UK
    prisma.measurementUnitTranslation.upsert({
      where: {
        unitId_languageId: {
          unitId: gUnit.id,
          languageId: ukLanguage.id,
        },
      },
      create: {
        languageId: ukLanguage.id,
        unitId: gUnit.id,
        label: 'г',
      },
      update: {
        languageId: ukLanguage.id,
        unitId: gUnit.id,
        label: 'г',
      },
    }),

    // KG translated to EN
    prisma.measurementUnitTranslation.upsert({
      where: {
        unitId_languageId: {
          unitId: kgUnit.id,
          languageId: enLanguage.id,
        },
      },
      create: {
        languageId: enLanguage.id,
        unitId: kgUnit.id,
        label: 'kg',
      },
      update: {
        languageId: enLanguage.id,
        unitId: kgUnit.id,
        label: 'kg',
      },
    }),

    // KG translated to UK
    prisma.measurementUnitTranslation.upsert({
      where: {
        unitId_languageId: {
          unitId: kgUnit.id,
          languageId: ukLanguage.id,
        },
      },
      create: {
        languageId: ukLanguage.id,
        unitId: kgUnit.id,
        label: 'кг',
      },
      update: {
        languageId: ukLanguage.id,
        unitId: kgUnit.id,
        label: 'кг',
      },
    }),

    // ML translated to EN
    prisma.measurementUnitTranslation.upsert({
      where: {
        unitId_languageId: {
          unitId: mlUnit.id,
          languageId: enLanguage.id,
        },
      },
      create: {
        languageId: enLanguage.id,
        unitId: mlUnit.id,
        label: 'ml',
      },
      update: {
        languageId: enLanguage.id,
        unitId: mlUnit.id,
        label: 'ml',
      },
    }),

    // ML translated to UK
    prisma.measurementUnitTranslation.upsert({
      where: {
        unitId_languageId: {
          unitId: mlUnit.id,
          languageId: ukLanguage.id,
        },
      },
      create: {
        languageId: ukLanguage.id,
        unitId: mlUnit.id,
        label: 'мл',
      },
      update: {
        languageId: ukLanguage.id,
        unitId: mlUnit.id,
        label: 'мл',
      },
    }),

    // L translated to EN
    prisma.measurementUnitTranslation.upsert({
      where: {
        unitId_languageId: {
          unitId: lUnit.id,
          languageId: enLanguage.id,
        },
      },
      create: {
        languageId: enLanguage.id,
        unitId: lUnit.id,
        label: 'l',
      },
      update: {
        languageId: enLanguage.id,
        unitId: lUnit.id,
        label: 'l',
      },
    }),

    // L translated to UK
    prisma.measurementUnitTranslation.upsert({
      where: {
        unitId_languageId: {
          unitId: lUnit.id,
          languageId: ukLanguage.id,
        },
      },
      create: {
        languageId: ukLanguage.id,
        unitId: lUnit.id,
        label: 'л',
      },
      update: {
        languageId: ukLanguage.id,
        unitId: lUnit.id,
        label: 'л',
      },
    }),

    // PC translated to EN
    prisma.measurementUnitTranslation.upsert({
      where: {
        unitId_languageId: {
          unitId: pcUnit.id,
          languageId: enLanguage.id,
        },
      },
      create: {
        languageId: enLanguage.id,
        unitId: pcUnit.id,
        label: 'pc',
      },
      update: {
        languageId: enLanguage.id,
        unitId: pcUnit.id,
        label: 'pc',
      },
    }),

    // PC translated to UK
    prisma.measurementUnitTranslation.upsert({
      where: {
        unitId_languageId: {
          unitId: pcUnit.id,
          languageId: ukLanguage.id,
        },
      },
      create: {
        languageId: ukLanguage.id,
        unitId: pcUnit.id,
        label: 'шт',
      },
      update: {
        languageId: ukLanguage.id,
        unitId: pcUnit.id,
        label: 'шт',
      },
    }),
  ])

  // eslint-disable-next-line no-console
  console.log('Measurement unit translations seeded ✅')
}
