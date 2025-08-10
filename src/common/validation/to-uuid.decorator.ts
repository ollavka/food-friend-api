import { applyDecorators } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { ValidationOptions } from 'class-validator'
import { hashToUuid } from '../util'
import { IsId } from '.'

export function ToUuid(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    IsId(validationOptions),
    Transform(
      ({ value }) =>
        validationOptions?.each && Array.isArray(value) ? value.map((item) => hashToUuid(item)) : hashToUuid(value),
      { toPlainOnly: true },
    ),
  )
}
