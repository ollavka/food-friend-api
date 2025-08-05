import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator'
import { isUuid } from '../util'

export function IsUuid(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isUuid',
      validator: {
        validate: (value: unknown): boolean => isUuid(value),
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + '$property must be a valid UUID', options),
      },
    },
    options,
  )
}
