import { describe, expect, it } from '@jest/globals'
import { IsString } from 'class-validator'
import { ValidationException } from '@common/exception'
import { validationPipeFactory } from './validation.pipe'

class ValidationDto {
  @IsString()
  public name: string
}

describe('validationPipeFactory', () => {
  it('should create validation pipe and transform valid payload', async () => {
    const pipe = validationPipeFactory()

    const result = await pipe.transform({ name: 'Food Friend' }, { type: 'body', metatype: ValidationDto } as never)

    expect(result).toMatchObject({ name: 'Food Friend' })
  })

  it('should throw ValidationException for invalid payload', async () => {
    const pipe = validationPipeFactory()

    await expect(
      pipe.transform({ name: 10 }, { type: 'body', metatype: ValidationDto } as never),
    ).rejects.toBeInstanceOf(ValidationException)
  })
})
