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
    slug: 'sour-cream',
    measurementBaseTypeKey: MeasurementBaseTypeKey.VOLUME,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Sour cream' },
      { languageCode: LanguageCode.UK, name: 'Сметана' },
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
    slug: 'sugar',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Sugar' },
      { languageCode: LanguageCode.UK, name: 'Цукор' },
    ],
  },
  {
    slug: 'flour',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Flour' },
      { languageCode: LanguageCode.UK, name: 'Борошно' },
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
    slug: 'pork-ribs',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Pork ribs' },
      { languageCode: LanguageCode.UK, name: 'Свинячі ребра' },
    ],
  },
  {
    slug: 'beet',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
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
    slug: 'carrot',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Carrot' },
      { languageCode: LanguageCode.UK, name: 'Морква' },
    ],
  },
  {
    slug: 'onion',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Onion' },
      { languageCode: LanguageCode.UK, name: 'Цибуля ріпчаста' },
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
    slug: 'tomato-paste',
    measurementBaseTypeKey: MeasurementBaseTypeKey.VOLUME,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Tomato paste' },
      { languageCode: LanguageCode.UK, name: 'Томатна паста' },
    ],
  },
  {
    slug: 'salmon-fillet',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Salmon fillet' },
      { languageCode: LanguageCode.UK, name: 'Філе лосося' },
    ],
  },
  {
    slug: 'orange',
    measurementBaseTypeKey: MeasurementBaseTypeKey.COUNT,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Orange' },
      { languageCode: LanguageCode.UK, name: 'Апельсин' },
    ],
  },
  {
    slug: 'honey',
    measurementBaseTypeKey: MeasurementBaseTypeKey.VOLUME,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Honey' },
      { languageCode: LanguageCode.UK, name: 'Мед' },
    ],
  },
  {
    slug: 'soy-sauce',
    measurementBaseTypeKey: MeasurementBaseTypeKey.VOLUME,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Soy sauce' },
      { languageCode: LanguageCode.UK, name: 'Соєвий соус' },
    ],
  },
  {
    slug: 'olive-oil',
    measurementBaseTypeKey: MeasurementBaseTypeKey.VOLUME,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Olive oil' },
      { languageCode: LanguageCode.UK, name: 'Оливкова олія' },
    ],
  },
  {
    slug: 'chicken-fillet',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Chicken fillet' },
      { languageCode: LanguageCode.UK, name: 'Куряче філе' },
    ],
  },
  {
    slug: 'romaine-lettuce',
    measurementBaseTypeKey: MeasurementBaseTypeKey.COUNT,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Romaine lettuce' },
      { languageCode: LanguageCode.UK, name: 'Салат Ромен' },
    ],
  },
  {
    slug: 'cherry-tomatoes',
    measurementBaseTypeKey: MeasurementBaseTypeKey.COUNT,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Cherry tomatoes' },
      { languageCode: LanguageCode.UK, name: 'Помідори чері' },
    ],
  },
  {
    slug: 'white-bread',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'White bread' },
      { languageCode: LanguageCode.UK, name: 'Білий хліб' },
    ],
  },
  {
    slug: 'parmesan',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Parmesan' },
      { languageCode: LanguageCode.UK, name: 'Пармезан' },
    ],
  },
  {
    slug: 'mustard',
    measurementBaseTypeKey: MeasurementBaseTypeKey.VOLUME,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Mustard' },
      { languageCode: LanguageCode.UK, name: 'Гірчиця' },
    ],
  },
  {
    slug: 'lemon',
    measurementBaseTypeKey: MeasurementBaseTypeKey.COUNT,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Lemon' },
      { languageCode: LanguageCode.UK, name: 'Лимон' },
    ],
  },
  {
    slug: 'pitted-cherry',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Pitted cherry' },
      { languageCode: LanguageCode.UK, name: 'Вишня (без кісточок)' },
    ],
  },
  {
    slug: 'starch',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Starch' },
      { languageCode: LanguageCode.UK, name: 'Крохмаль' },
    ],
  },
  {
    slug: 'spaghetti',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Spaghetti' },
      { languageCode: LanguageCode.UK, name: 'Спагеті' },
    ],
  },
  {
    slug: 'bacon',
    measurementBaseTypeKey: MeasurementBaseTypeKey.MASS,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Bacon' },
      { languageCode: LanguageCode.UK, name: 'Бекон' },
    ],
  },
  {
    slug: 'cream-20',
    measurementBaseTypeKey: MeasurementBaseTypeKey.VOLUME,
    translations: [
      { languageCode: LanguageCode.EN, name: 'Cream 20%' },
      { languageCode: LanguageCode.UK, name: 'Вершки 20%' },
    ],
  },
]
