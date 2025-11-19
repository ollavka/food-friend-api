import { applyDecorators } from '@nestjs/common'
import { ValidationOptions, IsString as _IsString } from 'class-validator'
import { withI18nMessage } from './with-i18n-message.util'

export function IsString(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(_IsString(withI18nMessage('validation.string', validationOptions)))
}
