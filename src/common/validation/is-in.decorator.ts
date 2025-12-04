import { applyDecorators } from '@nestjs/common'
import { ValidationOptions, IsIn as _IsIn } from 'class-validator'
import { withI18nMessage } from './with-i18n-message.util'

export function IsIn(
  availableValues: any[] | readonly any[],
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  const values = Object.values(availableValues).join(', ')

  return applyDecorators(
    _IsIn(availableValues, withI18nMessage('validation.availableValues', validationOptions, { values })),
  )
}
