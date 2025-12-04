import { applyDecorators } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { ValidationOptions, IsBoolean as _IsBoolean } from 'class-validator'
import { match } from 'ts-pattern'
import { withI18nMessage } from './with-i18n-message.util'

export function IsBoolean(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) =>
      match(value)
        .with('true', () => true)
        .with('false', () => false)
        .otherwise(() => value),
    ),
    _IsBoolean(withI18nMessage('validation.boolean', validationOptions)),
  )
}
