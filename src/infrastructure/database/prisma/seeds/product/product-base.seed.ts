import { PrismaClient } from '@prisma/client'
import { SeededMeasurementBaseTypeMap } from '../measurement-base-type/type'
import { productsSeedData } from './products.data'
import { SeededProductMap } from './type'

export async function seedProductsBase(
  prisma: PrismaClient,
  baseTypes: SeededMeasurementBaseTypeMap,
): Promise<SeededProductMap> {
  // eslint-disable-next-line no-console
  console.log('Seeding products...')

  const seededProducts = await Promise.all(
    productsSeedData.map((product) =>
      prisma.product.upsert({
        where: {
          slug: product.slug,
        },
        create: {
          slug: product.slug,
          measurementBaseTypeId: baseTypes[product.measurementBaseTypeKey].id,
        },
        update: {
          slug: product.slug,
          measurementBaseTypeId: baseTypes[product.measurementBaseTypeKey].id,
        },
      }),
    ),
  )

  const productsMap = productsSeedData.reduce<SeededProductMap>((acc, product, index) => {
    acc[product.slug] = seededProducts[index]
    return acc
  }, {} as SeededProductMap)

  // eslint-disable-next-line no-console
  console.log('Products seeded ✅')

  return productsMap
}
