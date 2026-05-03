import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { LanguageCode, MeasurementBaseTypeKey, MeasurementUnitKey, RecipeDifficultyKey } from '@prisma/client'
import { seedLanguages } from './languages/seed'
import { seedMeasurementBaseTypes } from './measurement-base-type/seed'
import { seedMeasurementUnits } from './measurement-unit/seed'
import { productsSeedData } from './product/products.data'
import { seedProducts } from './product/seed'
import { seedRecipeDifficulties } from './recipe-difficulty/seed'

describe('Prisma seed modules', () => {
  const createPrismaMock = (): any => ({
    language: {
      upsert: jest.fn(({ where }: any) => Promise.resolve({ id: `language-${where.code}`, code: where.code })),
    },
    languageTranslation: {
      upsert: jest.fn(() => Promise.resolve({})),
    },
    measurementBaseType: {
      upsert: jest.fn(({ where }: any) => Promise.resolve({ id: `base-${where.key}`, key: where.key })),
    },
    measurementBaseTypeTranslation: {
      upsert: jest.fn(() => Promise.resolve({})),
    },
    measurementUnit: {
      upsert: jest.fn(({ where }: any) => Promise.resolve({ id: `unit-${where.key}`, key: where.key })),
    },
    measurementUnitTranslation: {
      upsert: jest.fn(() => Promise.resolve({})),
    },
    product: {
      upsert: jest.fn(({ where }: any) => Promise.resolve({ id: `product-${where.slug}`, slug: where.slug })),
    },
    productTranslation: {
      upsert: jest.fn(() => Promise.resolve({})),
    },
    recipeDifficulty: {
      upsert: jest.fn(({ where }: any) => Promise.resolve({ id: `difficulty-${where.key}`, key: where.key })),
    },
    recipeDifficultyTranslation: {
      upsert: jest.fn(() => Promise.resolve({})),
    },
  })

  let prisma: any

  beforeEach(() => {
    prisma = createPrismaMock()
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  it('should seed base languages and their translations', async () => {
    const languages = await seedLanguages(prisma)

    expect(prisma.language.upsert).toHaveBeenCalledTimes(2)
    expect(prisma.languageTranslation.upsert).toHaveBeenCalledTimes(4)
    expect(languages[LanguageCode.EN]).toEqual({ id: 'language-EN', code: LanguageCode.EN })
    expect(languages[LanguageCode.UK]).toEqual({ id: 'language-UK', code: LanguageCode.UK })
  })

  it('should seed measurement base types and localized labels', async () => {
    const languages = {
      [LanguageCode.EN]: { id: 'language-EN' },
      [LanguageCode.UK]: { id: 'language-UK' },
    } as any

    const baseTypes = await seedMeasurementBaseTypes(prisma, languages)

    expect(prisma.measurementBaseType.upsert).toHaveBeenCalledTimes(3)
    expect(prisma.measurementBaseTypeTranslation.upsert).toHaveBeenCalledTimes(6)
    expect(baseTypes[MeasurementBaseTypeKey.MASS]).toEqual({
      id: 'base-MASS',
      key: MeasurementBaseTypeKey.MASS,
    })
  })

  it('should seed measurement units and localized labels', async () => {
    const baseTypes = {
      [MeasurementBaseTypeKey.MASS]: { id: 'base-MASS' },
      [MeasurementBaseTypeKey.VOLUME]: { id: 'base-VOLUME' },
      [MeasurementBaseTypeKey.COUNT]: { id: 'base-COUNT' },
    } as any

    const languages = {
      [LanguageCode.EN]: { id: 'language-EN' },
      [LanguageCode.UK]: { id: 'language-UK' },
    } as any

    const units = await seedMeasurementUnits(prisma, baseTypes, languages)

    expect(prisma.measurementUnit.upsert).toHaveBeenCalledTimes(5)
    expect(prisma.measurementUnitTranslation.upsert).toHaveBeenCalledTimes(10)
    expect(units[MeasurementUnitKey.PC]).toEqual({ id: 'unit-PC', key: MeasurementUnitKey.PC })
  })

  it('should seed products and translations from static data set', async () => {
    const baseTypes = {
      [MeasurementBaseTypeKey.MASS]: { id: 'base-MASS' },
      [MeasurementBaseTypeKey.VOLUME]: { id: 'base-VOLUME' },
      [MeasurementBaseTypeKey.COUNT]: { id: 'base-COUNT' },
    } as any

    const languages = {
      [LanguageCode.EN]: { id: 'language-EN' },
      [LanguageCode.UK]: { id: 'language-UK' },
    } as any

    const products = await seedProducts(prisma, baseTypes, languages)
    const translationsCount = productsSeedData.reduce((count, product) => count + product.translations.length, 0)

    expect(prisma.product.upsert).toHaveBeenCalledTimes(productsSeedData.length)
    expect(prisma.productTranslation.upsert).toHaveBeenCalledTimes(translationsCount)
    expect(products[productsSeedData[0].slug].id).toBe(`product-${productsSeedData[0].slug}`)
  })

  it('should seed recipe difficulties and localized labels', async () => {
    const languages = {
      [LanguageCode.EN]: { id: 'language-EN' },
      [LanguageCode.UK]: { id: 'language-UK' },
    } as any

    const recipeDifficulties = await seedRecipeDifficulties(prisma, languages)

    expect(prisma.recipeDifficulty.upsert).toHaveBeenCalledTimes(3)
    expect(prisma.recipeDifficultyTranslation.upsert).toHaveBeenCalledTimes(6)
    expect(recipeDifficulties[RecipeDifficultyKey.EASY]).toEqual({
      id: 'difficulty-EASY',
      key: RecipeDifficultyKey.EASY,
    })
  })
})
