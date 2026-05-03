import { describe, expect, it } from '@jest/globals'
import {
  normalizeNullableInteger,
  normalizeNullableNumber,
  normalizeNumber,
  normalizeOptionalString,
  normalizeRequiredString,
  normalizeStringArray,
} from './normalize-value.util'

describe('normalize-value util', () => {
  it('should trim and return value for normalizeRequiredString', () => {
    expect(normalizeRequiredString('  hello  ', 'field')).toBe('hello')
  })

  it('should throw for invalid normalizeRequiredString input', () => {
    expect(() => normalizeRequiredString('  ', 'title')).toThrow('Field "title" is missing or invalid.')
  })

  it('should return null for empty normalizeOptionalString input', () => {
    expect(normalizeOptionalString(undefined)).toBeNull()
    expect(normalizeOptionalString('   ')).toBeNull()
  })

  it('should filter non-string and empty items in normalizeStringArray', () => {
    expect(normalizeStringArray([' a ', 1, '', ' b '], 'items')).toEqual(['a', 'b'])
  })

  it('should apply fallback for normalizeNumber outside allowed range', () => {
    expect(normalizeNumber(10, 0, { min: 1, max: 20 })).toBe(10)
    expect(normalizeNumber(21, 0, { min: 1, max: 20 })).toBe(0)
    expect(normalizeNumber('10', 5, { min: 1, max: 20 })).toBe(5)
  })

  it('should return null for invalid normalizeNullableNumber values', () => {
    expect(normalizeNullableNumber(null)).toBeNull()
    expect(normalizeNullableNumber('1')).toBeNull()
    expect(normalizeNullableNumber(-1)).toBeNull()
    expect(normalizeNullableNumber(1.5)).toBe(1.5)
  })

  it('should round and validate bounds for normalizeNullableInteger', () => {
    expect(normalizeNullableInteger(3.4, { min: 1, max: 5 })).toBe(3)
    expect(normalizeNullableInteger(5.6, { min: 1, max: 5 })).toBeNull()
    expect(normalizeNullableInteger('3', { min: 1, max: 5 })).toBeNull()
  })
})
