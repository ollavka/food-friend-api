import { LanguageCode, MeasurementBaseTypeKey } from '@prisma/client'

type ProductSeedData = {
  slug: string
  measurementBaseTypeKey: MeasurementBaseTypeKey
  translations: {
    languageCode: LanguageCode
    name: string
  }[]
}

export const productsSeedData: ProductSeedData[] = [
  {
    slug: 'pork-ribs',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Pork ribs' },
      { languageCode: LanguageCode.UK, name: 'Свинячі ребра' },
    ],
  },
  {
    slug: 'beet',
    measurementBaseTypeKey: MeasurementBaseTypeKey.COUNT,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Beet' },
      { languageCode: LanguageCode.UK, name: 'Буряк' },
    ],
  },
  {
    slug: 'potato',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Potato' },
      { languageCode: LanguageCode.UK, name: 'Картопля' },
    ],
  },
  {
    slug: 'cabbage',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Cabbage' },
      { languageCode: LanguageCode.UK, name: 'Капуста білокачанна' },
    ],
  },
  {
    slug: 'garlic',
    measurementBaseTypeKey: MeasurementBaseTypeKey.COUNT,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Garlic' },
      { languageCode: LanguageCode.UK, name: 'Часник' },
    ],
  },
  {
    slug: 'sour-cream',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Sour cream' },
      { languageCode: LanguageCode.UK, name: 'Сметана' },
    ],
  },
  {
    slug: 'cottage-cheese',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Cottage cheese' },
      { languageCode: LanguageCode.UK, name: 'Сир кисломолочний' },
    ],
  },
  {
    slug: 'egg',
    measurementBaseTypeKey: MeasurementBaseTypeKey.COUNT,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Egg' },
      { languageCode: LanguageCode.UK, name: 'Яйце' },
    ],
  },
  {
    slug: 'flour',
    measurementBaseTypeKey: MeasurementBaseTypeKey.VOLUME,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Flour' },
      { languageCode: LanguageCode.UK, name: 'Борошно' },
    ],
  },
  {
    slug: 'sugar',
    measurementBaseTypeKey: MeasurementBaseTypeKey.VOLUME,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Sugar' },
      { languageCode: LanguageCode.UK, name: 'Цукор' },
    ],
  },
]
