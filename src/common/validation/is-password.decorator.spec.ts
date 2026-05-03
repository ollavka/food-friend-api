import { describe, expect, it } from '@jest/globals'
import { validateSync } from 'class-validator'
import { IsPassword } from './is-password.decorator'

class TestPasswordDto {
  @IsPassword()
  public password!: string
}

describe('IsPassword', () => {
  it('should validate strong password', () => {
    const dto = Object.assign(new TestPasswordDto(), {
      password: 'StrongP@ss1',
    })

    expect(validateSync(dto)).toHaveLength(0)
  })

  it('should reject password without uppercase letter', () => {
    const dto = Object.assign(new TestPasswordDto(), {
      password: 'weakp@ss1',
    })

    expect(validateSync(dto)).toHaveLength(1)
  })

  it('should reject password without special character', () => {
    const dto = Object.assign(new TestPasswordDto(), {
      password: 'StrongPass1',
    })

    expect(validateSync(dto)).toHaveLength(1)
  })
})
