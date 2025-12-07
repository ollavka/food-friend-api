import { PrismaClient } from '@prisma/client'
import { SeededLanguagesMap } from '../languages/type'
import { productsSeedData } from './products.data'
import { SeededProductMap } from './type'

export async function seedProductTranslations(
  prisma: PrismaClient,
  products: SeededProductMap,
  languages: SeededLanguagesMap,
): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Seeding product translations...')

  await Promise.all(
    productsSeedData.flatMap((product) =>
      product.translations.map((translation) => {
        const productRecord = products[product.slug]
        const language = languages[translation.languageCode]

        return prisma.productTranslation.upsert({
          where: {
            productId_languageId: {
              productId: productRecord.id,
              languageId: language.id,
            },
          },
          create: {
            productId: productRecord.id,
            languageId: language.id,
            name: translation.name,
          },
          update: {
            productId: productRecord.id,
            languageId: language.id,
            name: translation.name,
          },
        })
      }),
    ),
  )

  // eslint-disable-next-line no-console
  console.log('Product translations seeded ✅')
}
