import { applyDecorators } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { ValidationOptions } from 'class-validator'
import { hashToUuid } from '../util'
import { IsId } from '.'

export function ToUuid(options?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    IsId(options),
    Transform(
      ({ value }) =>
        options?.each && Array.isArray(value) ? value.map((item) => hashToUuid(item)) : hashToUuid(value),
      { toClassOnly: true },
    ),
  )
}
