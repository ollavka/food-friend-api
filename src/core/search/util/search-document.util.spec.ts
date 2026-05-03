import { describe, expect, it } from '@jest/globals'
import { LanguageCode } from '@prisma/client'
import {
  buildLocalizedMap,
  normalizeStringArray,
  normalizeStringMap,
  pickLocalizedValue,
  uniqueValues,
} from './search-document.util'

describe('Search document utilities', () => {
  it('should build localized map and trim values', () => {
    const map = buildLocalizedMap(
      [
        { language: { code: LanguageCode.EN }, value: ' Potato ' },
        { language: { code: LanguageCode.UK }, value: ' Картопля ' },
        { language: { code: LanguageCode.EN }, value: '' },
      ],
      (item) => item.value,
    )

    expect(map).toEqual({
      en: 'Potato',
      uk: 'Картопля',
    })
  })

  it('should pick localized value with fallback', () => {
    const value = pickLocalizedValue({ uk: 'Картопля', en: 'Potato' }, LanguageCode.EN, LanguageCode.UK)
    const fallbackValue = pickLocalizedValue({ uk: 'Картопля' }, LanguageCode.EN, LanguageCode.UK)

    expect(value).toBe('Potato')
    expect(fallbackValue).toBe('Картопля')
  })

  it('should normalize unique values and maps', () => {
    expect(uniqueValues([' one ', 'one', null, 'two', ''])).toEqual(['one', 'two'])

    expect(normalizeStringMap({ a: ' one ', b: 1, c: '  ' })).toEqual({ a: 'one' })
    expect(normalizeStringMap(null)).toEqual({})

    expect(normalizeStringArray([' one ', 12, '', 'two'])).toEqual(['one', 'two'])
    expect(normalizeStringArray(null)).toEqual([])
  })
})
