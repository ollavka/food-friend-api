import { applyDecorators } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { ValidationOptions, IsInt as _IsInt } from 'class-validator'
import { withI18nMessage } from './with-i18n-message.util'

export function IsInt(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) => (Number.isNaN(+value) ? null : +value)),
    _IsInt(withI18nMessage('validation.integer', validationOptions)),
  )
}
