import { LanguageCode } from '@prisma/client'
import type { Request } from 'express'
import { toUpperCase } from './to-upper-case.util'

export function normalizeLanguageCode(input: unknown): LanguageCode | null {
  if (typeof input !== 'string') {
    return null
  }

  const rawLanguageCode = input.trim()

  if (!rawLanguageCode) {
    return null
  }

  const upperInputLanguageCode = toUpperCase(rawLanguageCode)

  const targetLanguageCode = Object.values(LanguageCode).find((languageCode) => {
    const upperCurrentLanguageCode = toUpperCase(languageCode)
    const locales = [`${upperCurrentLanguageCode}_`, `${upperCurrentLanguageCode}-`]

    const isTargetLanguage = upperInputLanguageCode === upperCurrentLanguageCode
    const isTargetLocale = locales.some((locale) => upperInputLanguageCode.startsWith(locale))
    return isTargetLanguage || isTargetLocale
  })

  return targetLanguageCode ?? null
}

export function getRequestLanguage(req: Request, options?: { fallback?: LanguageCode }): LanguageCode {
  const fallbackLanguage = options?.fallback ?? req.defaultLanguageCode ?? LanguageCode.UK

  const queryLang = (req.query?.lang as string | undefined) ?? null
  const headerLang = (req.headers['x-lang'] as string | undefined) ?? null
  const userLang = (req.user?.languageCode as LanguageCode | undefined) ?? null

  const languageVariants: Array<string | null | undefined> = [queryLang, headerLang, userLang]

  for (const languageVariant of languageVariants) {
    if (!languageVariant) {
      continue
    }

    const normalizedLanguageCode = normalizeLanguageCode(languageVariant)

    if (normalizedLanguageCode) {
      return normalizedLanguageCode
    }
  }

  return fallbackLanguage
}

export function isLanguageCode(code: any): code is LanguageCode {
  return Object.values(LanguageCode).includes(code)
}

export function getLanguageLabelByCode(code: LanguageCode): string {
  switch (code) {
    case LanguageCode.EN:
      return 'English'
    case LanguageCode.UK:
      return 'Ukrainian'
    default:
      return code
  }
}

export function pickTranslationByLanguage<T extends { languageId: string }>(
  translations: T[],
  languageId: string,
  defaultLanguageId: string,
): T | null {
  return (
    translations.find((translation) => translation.languageId === languageId) ??
    translations.find((translation) => translation.languageId === defaultLanguageId) ??
    translations[0] ??
    null
  )
}
