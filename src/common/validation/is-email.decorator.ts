import { applyDecorators } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { ValidationOptions, IsEmail as _IsEmail } from 'class-validator'
import { toLowerCase } from '../util'
import { withI18nMessage } from './with-i18n-message.util'

export function IsEmail(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    _IsEmail(undefined, withI18nMessage('validation.email', validationOptions)),
    Transform(({ value }) =>
      validationOptions?.each && Array.isArray(value) ? value.map((item) => toLowerCase(item)) : toLowerCase(value),
    ),
  )
}
