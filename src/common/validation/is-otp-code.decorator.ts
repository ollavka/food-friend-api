import { applyDecorators } from '@nestjs/common'
import { IsNumberString, ValidateBy, ValidationOptions, buildMessage } from 'class-validator'
import { OTP_CODE_LENGTH } from '@common/constant'
import { IsNotEmpty } from './is-not-empty.decorator'
import { withI18nMessage } from './with-i18n-message.util'

export function IsOTPCode(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    IsNotEmpty(validationOptions),
    IsNumberString({ no_symbols: true }, withI18nMessage('validation.number', validationOptions)),
    isValidOTPLength(validationOptions),
  )
}

function isValidOTPLength(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isValidOTPLength',
      validator: {
        validate: (value) => typeof value !== 'string' || value.length === OTP_CODE_LENGTH,
        defaultMessage: buildMessage((eachPrefix, args) => {
          const value = String(args?.value)
          return eachPrefix + `$property must be exactly ${OTP_CODE_LENGTH} digits long (got ${value.length})`
        }, validationOptions),
      },
    },
    withI18nMessage('validation.otp.length', validationOptions, { length: OTP_CODE_LENGTH }),
  )
}
