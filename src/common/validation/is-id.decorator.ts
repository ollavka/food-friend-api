import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator'
import { isHash } from '../util'

export function IsId(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isId',
      validator: {
        validate: (value: unknown): boolean => isHash(value),
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + '$property must be a valid ID', options),
      },
    },
    options,
  )
}
