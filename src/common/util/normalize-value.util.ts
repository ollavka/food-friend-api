export type NormalizeErrorFactory = (message: string) => Error

export function normalizeRequiredString(value: unknown, field: string, errorFactory?: NormalizeErrorFactory): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throwNormalizeError(`Field "${field}" is missing or invalid.`, errorFactory)
  }

  return value.trim()
}

export function normalizeOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function normalizeStringArray(value: unknown, field: string, errorFactory?: NormalizeErrorFactory): string[] {
  if (!Array.isArray(value)) {
    throwNormalizeError(`Field "${field}" must be array.`, errorFactory)
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function normalizeNumber(
  value: unknown,
  fallback: number,
  params: {
    min: number
    max: number
  },
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  if (value < params.min || value > params.max) {
    return fallback
  }

  return value
}

export function normalizeNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null
  }

  return value
}

export function normalizeNullableInteger(
  value: unknown,
  params: {
    min: number
    max: number
  },
): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  const normalizedValue = Math.round(value)

  if (normalizedValue < params.min || params.max < normalizedValue) {
    return null
  }

  return normalizedValue
}

function throwNormalizeError(message: string, errorFactory?: NormalizeErrorFactory): never {
  if (errorFactory) {
    throw errorFactory(message)
  }

  throw new Error(message)
}
