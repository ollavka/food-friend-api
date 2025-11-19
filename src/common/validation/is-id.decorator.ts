import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator'
import { isHash } from '../util'
import { withI18nMessage } from './with-i18n-message.util'

export function IsId(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isId',
      validator: {
        validate: (value: unknown): boolean => isHash(value),
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + '$property must be a valid ID', validationOptions),
      },
    },
    withI18nMessage('validation.id', validationOptions),
  )
}
