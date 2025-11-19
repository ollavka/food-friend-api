import { ValidateBy, ValidationOptions, buildMessage, length } from 'class-validator'
import { P, match } from 'ts-pattern'
import { withI18nMessage } from './with-i18n-message.util'

export function IsLength(min: number, max?: number, validationOptions?: ValidationOptions): PropertyDecorator {
  const { scenario, args } = match({ min, max })
    .when(
      ({ min, max }) => min === max,
      ({ min }) => ({ scenario: 'exact' as const, args: { length: min } }),
    )
    .with({ max: P.nonNullable }, ({ min, max }) => ({ scenario: 'range' as const, args: { min, max } }))
    .otherwise(({ min }) => ({ scenario: 'min' as const, args: { min } }))

  return ValidateBy(
    {
      name: 'isLength',
      constraints: [min, max],
      validator: {
        validate: (value, args): boolean => length(value, args?.constraints[0], args?.constraints[1]),
        defaultMessage: buildMessage((eachPrefix, args) => {
          if (!args) {
            throw new Error('No args specified for IsLength decorator.')
          }

          const [min, max] = <[number, number]>args.constraints

          const message = match({ min, max })
            .when(
              ({ min, max }) => min === max,
              () => '$property must be $constraint1 characters in length',
            )
            .with(
              { max: P.nonNullable },
              () =>
                '$property must be longer than or equal to $constraint1 and shorter than or equal to $constraint2 characters',
            )
            .otherwise(() => '$property must be longer than or equal to $constraint1 characters')

          return eachPrefix + message
        }, validationOptions),
      },
    },
    withI18nMessage(`validation.length.${scenario}`, validationOptions, args),
  )
}
