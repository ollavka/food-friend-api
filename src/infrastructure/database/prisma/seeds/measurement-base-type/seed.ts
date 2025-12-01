import { PrismaClient } from '@prisma/client'
import { SeededLanguagesMap } from '../languages/type'
import { seedMeasurementBaseTypesBase } from './measurement-base-type-base.seed'
import { seedMeasurementBaseTypeTranslations } from './measurement-base-type-translations.seed'
import { SeededMeasurementBaseTypeMap } from './type'

export async function seedMeasurementBaseTypes(
  prisma: PrismaClient,
  languages: SeededLanguagesMap,
): Promise<SeededMeasurementBaseTypeMap> {
  const baseTypes = await seedMeasurementBaseTypesBase(prisma)
  await seedMeasurementBaseTypeTranslations(prisma, baseTypes, languages)
  return baseTypes
}
