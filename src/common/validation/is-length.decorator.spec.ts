import { describe, expect, it } from '@jest/globals'
import { validateSync } from 'class-validator'
import { IsLength } from './is-length.decorator'

class ExactLengthDto {
  @IsLength(4, 4)
  public value!: string
}

class MinLengthDto {
  @IsLength(3)
  public value!: string
}

class RangeLengthDto {
  @IsLength(2, 6)
  public value!: string
}

describe('IsLength', () => {
  it('should validate exact length scenario', () => {
    const validDto = Object.assign(new ExactLengthDto(), { value: 'test' })
    const invalidDto = Object.assign(new ExactLengthDto(), { value: 'tes' })

    expect(validateSync(validDto)).toHaveLength(0)
    expect(validateSync(invalidDto)).toHaveLength(1)
  })

  it('should validate minimum length scenario', () => {
    const validDto = Object.assign(new MinLengthDto(), { value: 'abc' })
    const invalidDto = Object.assign(new MinLengthDto(), { value: 'ab' })

    expect(validateSync(validDto)).toHaveLength(0)
    expect(validateSync(invalidDto)).toHaveLength(1)
  })

  it('should validate range length scenario', () => {
    const validDto = Object.assign(new RangeLengthDto(), { value: 'valid' })
    const invalidDto = Object.assign(new RangeLengthDto(), { value: 'toolong' })

    expect(validateSync(validDto)).toHaveLength(0)
    expect(validateSync(invalidDto)).toHaveLength(1)
  })
})
