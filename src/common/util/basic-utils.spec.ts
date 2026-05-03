import { beforeEach, describe, expect, it } from '@jest/globals'
import { HttpStatus } from '@nestjs/common'
import { TextCase } from '@common/enum'
import {
  buildCompositeKey,
  capitalize,
  def,
  enumKey,
  enumValue,
  extractHttpExceptionProperties,
  hashToUuid,
  hashValue,
  isDev,
  isEmptyObject,
  isHash,
  isRecord,
  isToken,
  randomHash,
  slugifyText,
  toJsonString,
  toLowerCase,
  toUpperCase,
  token,
  tokenToUuid,
  useOnlyIf,
  uuid,
  uuidToHash,
  uuidToToken,
} from '@common/util'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'

describe('Basic utility functions', () => {
  const setNodeEnv = (value: string): void => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value,
      configurable: true,
    })
  }

  beforeEach(() => {
    setNodeEnv('test')
  })

  it('should transform primitive values with simple helpers', () => {
    expect(capitalize('hELLO')).toBe('Hello')
    expect(buildCompositeKey('recipe', 12, 'item')).toBe('recipe:12:item')
    expect(toLowerCase('AbC')).toBe('abc')
    expect(toUpperCase('AbC')).toBe('ABC')
    expect(slugifyText('  Fresh Tomato Soup!!  ')).toBe('fresh-tomato-soup')
    expect(useOnlyIf('value', true)).toBe('value')
    expect(useOnlyIf('value', false)).toBeNull()
  })

  it('should validate defined values and object shapes', () => {
    expect(def('value')).toBe(true)
    expect(def(null)).toBe(false)
    expect(def(undefined)).toBe(false)

    expect(isEmptyObject(undefined)).toBe(true)
    expect(isEmptyObject(null)).toBe(true)
    expect(isEmptyObject({ a: null, b: undefined })).toBe(true)
    expect(isEmptyObject({ a: 1, b: null })).toBe(false)

    expect(isRecord({ foo: 'bar' })).toBe(true)
    expect(isRecord([])).toBe(false)
    expect(isRecord(null)).toBe(false)
  })

  it('should work with enum helpers', () => {
    expect(enumKey(HttpStatus, 404)).toBe('NOT_FOUND')
    expect(enumKey(HttpStatus, 999 as never)).toBeNull()

    expect(enumValue(HttpStatus, 'NOT_FOUND')).toBe(404)
    expect(enumValue(HttpStatus, 'UNKNOWN' as never)).toBeNull()
  })

  it('should build http exception properties from status code', () => {
    const result = extractHttpExceptionProperties(HttpStatus.NOT_FOUND)

    expect(result.type).toBe('not-found')
    expect(result.message).toBe('Not found.')
  })

  it('should serialize nullable values to json string', () => {
    expect(toJsonString({ ok: true })).toBe('{\n  "ok": true\n}')
    expect(toJsonString(null)).toBeNull()
    expect(toJsonString(undefined)).toBeUndefined()
  })

  it('should generate and validate uuid/hash/token values', () => {
    const generatedUuid = uuid()
    expect(typeof generatedUuid).toBe('string')
    expect(generatedUuid).toHaveLength(36)

    const hash = uuidToHash(VALID_UUID)
    expect(typeof hash).toBe('string')
    expect(isHash(hash)).toBe(true)
    expect(hashToUuid(hash)).toBe(VALID_UUID)
    expect(hashToUuid('invalid-hash-value-22' as never)).toBe('invalid-hash-value-22')

    const random = randomHash()
    expect(isHash(random)).toBe(true)

    const generatedToken = token()
    expect(generatedToken).toHaveLength(32)
    expect(isToken(generatedToken)).toBe(true)
    expect(uuidToToken(VALID_UUID)).toBe('123e4567e89b12d3a456426614174000')
    expect(tokenToUuid('123e4567e89b12d3a456426614174000')).toBe(VALID_UUID)
  })

  it('should detect development mode only for development env', () => {
    setNodeEnv('development')
    expect(isDev()).toBe(true)

    setNodeEnv('production')
    expect(isDev()).toBe(false)
  })

  it('should hash arbitrary string values', () => {
    const digest = hashValue('food-friend')

    expect(digest).toMatch(/^[a-f0-9]{64}$/)
  })

  it('should expose text-case enum for convert helpers contracts', () => {
    expect(TextCase.Camel).toBe('camel')
  })
})
