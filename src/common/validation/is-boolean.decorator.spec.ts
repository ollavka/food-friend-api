import { describe, expect, it } from '@jest/globals'
import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { IsBoolean } from './is-boolean.decorator'

class TestBooleanDto {
  @IsBoolean()
  public value!: boolean
}

describe('IsBoolean', () => {
  it('should transform string true/false to boolean', () => {
    const trueDto = plainToInstance(TestBooleanDto, { value: 'true' })
    const falseDto = plainToInstance(TestBooleanDto, { value: 'false' })

    expect(trueDto.value).toBe(true)
    expect(falseDto.value).toBe(false)
    expect(validateSync(trueDto)).toHaveLength(0)
    expect(validateSync(falseDto)).toHaveLength(0)
  })

  it('should fail validation for non-boolean value', () => {
    const dto = plainToInstance(TestBooleanDto, { value: 'not-boolean' })

    expect(validateSync(dto)).toHaveLength(1)
  })
})
