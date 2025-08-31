import { applyDecorators } from '@nestjs/common'
import { IsNotEmpty, IsNumberString, ValidateBy, ValidationOptions, buildMessage } from 'class-validator'
import { OTP_CODE_LENGTH } from '@common/constant'

export function IsOTPCode(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    IsNotEmpty(validationOptions),
    IsNumberString({ no_symbols: true }, validationOptions),
    isValidOTPLength(validationOptions),
  )
}

function isValidOTPLength(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy({
    name: 'isValidOTPLength',
    validator: {
      validate: (value) => typeof value !== 'string' || value.length === OTP_CODE_LENGTH,
      defaultMessage: buildMessage((eachPrefix, args) => {
        const value = String(args?.value)
        return eachPrefix + `$property must be exactly ${OTP_CODE_LENGTH} digits long (got ${value.length})`
      }, validationOptions),
    },
  })
}
