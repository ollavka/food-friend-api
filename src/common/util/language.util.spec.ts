import { describe, expect, it } from '@jest/globals'
import { LanguageCode } from '@prisma/client'
import type { Request } from 'express'
import {
  getLanguageLabelByCode,
  getRequestLanguage,
  isLanguageCode,
  normalizeLanguageCode,
  pickTranslationByLanguage,
} from './language.util'

describe('language util', () => {
  it('should normalize direct language code and locale format', () => {
    expect(normalizeLanguageCode('en')).toBe(LanguageCode.EN)
    expect(normalizeLanguageCode('uk-UA')).toBe(LanguageCode.UK)
    expect(normalizeLanguageCode('de')).toBeNull()
    expect(normalizeLanguageCode(123)).toBeNull()
    expect(normalizeLanguageCode('')).toBeNull()
  })

  it('should resolve language by priority query > header > user > fallback', () => {
    const req = {
      query: { lang: 'uk' },
      headers: { 'x-lang': 'en' },
      user: { languageCode: LanguageCode.EN },
      defaultLanguageCode: LanguageCode.EN,
    } as unknown as Request

    expect(getRequestLanguage(req)).toBe(LanguageCode.UK)
  })

  it('should return fallback when all request language variants are invalid', () => {
    const req = {
      query: { lang: 'invalid' },
      headers: { 'x-lang': 'invalid' },
      user: { languageCode: 'invalid' },
      defaultLanguageCode: LanguageCode.EN,
    } as unknown as Request

    expect(getRequestLanguage(req)).toBe(LanguageCode.EN)
  })

  it('should use custom fallback option when default variants are missing', () => {
    const req = {
      query: {},
      headers: {},
      user: undefined,
    } as unknown as Request

    expect(getRequestLanguage(req, { fallback: LanguageCode.UK })).toBe(LanguageCode.UK)
  })

  it('should resolve translation as current -> default -> first -> null', () => {
    const translations = [
      {
        languageId: 'uk',
        value: 'Привіт',
      },
      {
        languageId: 'en',
        value: 'Hello',
      },
    ]

    expect(pickTranslationByLanguage(translations, 'en', 'uk')?.value).toBe('Hello')
    expect(pickTranslationByLanguage(translations, 'de', 'uk')?.value).toBe('Привіт')
    expect(pickTranslationByLanguage(translations, 'de', 'fr')?.value).toBe('Привіт')
    expect(pickTranslationByLanguage([], 'en', 'uk')).toBeNull()
  })

  it('should validate language code and resolve language labels', () => {
    expect(isLanguageCode(LanguageCode.EN)).toBe(true)
    expect(isLanguageCode('de')).toBe(false)
    expect(getLanguageLabelByCode(LanguageCode.EN)).toBe('English')
    expect(getLanguageLabelByCode(LanguageCode.UK)).toBe('Ukrainian')
  })
})
