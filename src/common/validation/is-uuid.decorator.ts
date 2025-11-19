import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator'
import { isUuid } from '../util'
import { withI18nMessage } from './with-i18n-message.util'

export function IsUuid(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isUuid',
      validator: {
        validate: (value: unknown): boolean => isUuid(value),
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + '$property must be a valid UUID', validationOptions),
      },
    },
    withI18nMessage('validation.uuid', validationOptions),
  )
}
