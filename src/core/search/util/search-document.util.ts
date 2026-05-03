import { LanguageCode } from '@prisma/client'
import { isRecord, toLowerCase } from '@common/util'

type LocalizedValueItem<T> = {
  language: {
    code: LanguageCode
  }
} & T

export function buildLocalizedMap<T>(
  items: Array<LocalizedValueItem<T>>,
  valueSelector: (item: T) => string | null | undefined,
): Record<string, string> {
  const valueMap: Record<string, string> = {}

  for (const item of items) {
    const value = valueSelector(item)

    if (typeof value !== 'string') {
      continue
    }

    const normalizedValue = value.trim()

    if (!normalizedValue) {
      continue
    }

    valueMap[toLowerCase(item.language.code)] = normalizedValue
  }

  return valueMap
}

export function pickLocalizedValue(
  valueMap: Record<string, string>,
  languageCode: LanguageCode,
  defaultLanguageCode: LanguageCode,
): string | null {
  const currentLanguageCode = toLowerCase(languageCode)
  const fallbackLanguageCode = toLowerCase(defaultLanguageCode)

  return valueMap[currentLanguageCode] ?? valueMap[fallbackLanguageCode] ?? Object.values(valueMap)[0] ?? null
}

export function uniqueValues(values: Array<string | null | undefined>): string[] {
  const normalizedValues = values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)

  return [...new Set(normalizedValues)]
}

export function normalizeStringMap(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {}
  }

  const map: Record<string, string> = {}

  for (const [key, mapValue] of Object.entries(value)) {
    if (typeof mapValue !== 'string') {
      continue
    }

    const normalizedValue = mapValue.trim()

    if (!normalizedValue) {
      continue
    }

    map[key] = normalizedValue
  }

  return map
}

export function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}
