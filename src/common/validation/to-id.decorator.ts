import { applyDecorators } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { ValidationOptions } from 'class-validator'
import { uuidToHash } from '../util/hash.util'
import { IsUuid } from './is-uuid.decorator'

export function ToId(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    IsUuid(validationOptions),
    Transform(
      ({ value }) =>
        validationOptions?.each && Array.isArray(value) ? value.map((item) => uuidToHash(item)) : uuidToHash(value),
      { toPlainOnly: true },
    ),
  )
}
