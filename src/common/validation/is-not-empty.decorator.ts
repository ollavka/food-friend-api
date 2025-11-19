import { applyDecorators } from '@nestjs/common'
import { ValidationOptions, IsNotEmpty as _IsNotEmpty } from 'class-validator'
import { withI18nMessage } from './with-i18n-message.util'

export function IsNotEmpty(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(_IsNotEmpty(withI18nMessage('validation.required', validationOptions)))
}
