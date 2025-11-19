import { applyDecorators } from '@nestjs/common'
import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator'
import { IsLength } from './is-length.decorator'
import { IsNotEmpty } from './is-not-empty.decorator'
import { IsString } from './is-string.decorator'
import { withI18nMessage } from './with-i18n-message.util'

export function IsPassword(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    IsNotEmpty(validationOptions),
    IsString(validationOptions),
    IsLength(8, 32, validationOptions),
    ContainsDigits(validationOptions),
    ContainsLowercaseLetter(validationOptions),
    ContainsUppercaseLetter(validationOptions),
    ContainsSpecialCharacter(validationOptions),
  )
}

function ContainsDigits(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'containsDigits',
      validator: {
        validate: (value) => typeof value === 'string' && /[0-9]/.test(value),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must contains at least one digit',
          validationOptions,
        ),
      },
    },
    withI18nMessage('validation.password.digit', validationOptions),
  )
}

function ContainsLowercaseLetter(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'containsLowercaseLetter',
      validator: {
        validate: (value) => typeof value === 'string' && /[a-z]/.test(value),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must contains at least one lowercase letter',
          validationOptions,
        ),
      },
    },
    withI18nMessage('validation.password.lowercase', validationOptions),
  )
}

function ContainsUppercaseLetter(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'containsUppercaseLetter',
      validator: {
        validate: (value) => typeof value === 'string' && /[A-Z]/.test(value),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must contains at least one uppercase letter',
          validationOptions,
        ),
      },
    },
    withI18nMessage('validation.password.uppercase', validationOptions),
  )
}

function ContainsSpecialCharacter(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'containsSpecialCharacter',
      validator: {
        validate: (value) => typeof value === 'string' && /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(value),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must contains at least one special character',
          validationOptions,
        ),
      },
    },
    withI18nMessage('validation.password.special', validationOptions),
  )
}
