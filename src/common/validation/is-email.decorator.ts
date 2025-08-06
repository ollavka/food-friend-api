import { applyDecorators } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { IsEmail as IsEmail_, ValidationOptions } from 'class-validator'
import { toLowerCase } from '../util'

export function IsEmail(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    IsEmail_(undefined, validationOptions),
    Transform(({ value }) =>
      validationOptions?.each && Array.isArray(value) ? value.map((item) => toLowerCase(item)) : toLowerCase(value),
    ),
  )
}
