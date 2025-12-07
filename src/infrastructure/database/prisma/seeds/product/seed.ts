import { PrismaClient } from '@prisma/client'
import { SeededLanguagesMap } from '../languages/type'
import { SeededMeasurementBaseTypeMap } from '../measurement-base-type/type'
import { seedProductsBase } from './product-base.seed'
import { seedProductTranslations } from './product-translations.seed'
import { SeededProductMap } from './type'

export async function seedProducts(
  prisma: PrismaClient,
  baseTypes: SeededMeasurementBaseTypeMap,
  languages: SeededLanguagesMap,
): Promise<SeededProductMap> {
  const products = await seedProductsBase(prisma, baseTypes)
  await seedProductTranslations(prisma, products, languages)
  return products
}
