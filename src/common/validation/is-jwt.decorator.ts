import { applyDecorators } from '@nestjs/common'
import { ValidationOptions, IsJWT as _IsJWT } from 'class-validator'
import { withI18nMessage } from './with-i18n-message.util'

export function IsJWT(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(_IsJWT(withI18nMessage('validation.jwt', validationOptions)))
}
