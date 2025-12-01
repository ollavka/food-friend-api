import { PrismaClient } from '@prisma/client'
import { SeededLanguagesMap } from '../languages/type'
import { SeededMeasurementBaseTypeMap } from '../measurement-base-type/type'
import { seedMeasurementUnitsBase } from './measurement-unit-base.seed'
import { seedMeasurementUnitTranslations } from './measurement-unit-translations.seed'
import { SeededMeasurementUnitMap } from './type'

export async function seedMeasurementUnits(
  prisma: PrismaClient,
  baseTypes: SeededMeasurementBaseTypeMap,
  languages: SeededLanguagesMap,
): Promise<SeededMeasurementUnitMap> {
  const measurementUnits = await seedMeasurementUnitsBase(prisma, baseTypes)
  await seedMeasurementUnitTranslations(prisma, measurementUnits, languages)
  return measurementUnits
}
