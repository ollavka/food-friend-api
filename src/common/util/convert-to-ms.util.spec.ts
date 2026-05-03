import { describe, expect, it } from '@jest/globals'
import { convertToMs } from './convert-to-ms.util'

describe('convertToMs', () => {
  it('should convert values with explicit units', () => {
    expect(convertToMs('100ms')).toBe(100)
    expect(convertToMs('2sec' as never)).toBe(2_000)
    expect(convertToMs('1.5m')).toBe(90_000)
    expect(convertToMs('1h')).toBe(3_600_000)
  })

  it('should use milliseconds as default unit', () => {
    expect(convertToMs('250')).toBe(250)
  })

  it('should throw for invalid format or unknown unit', () => {
    expect(() => convertToMs('abc' as never)).toThrow('Invalid format')
    expect(() => convertToMs('12xy' as never)).toThrow('Unknown unit')
  })
})
