import { applyDecorators } from '@nestjs/common'
import { Min, ValidationOptions } from 'class-validator'
import { withI18nMessage } from './with-i18n-message.util'

export function IsMin(minValue: number, validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(Min(minValue, withI18nMessage('validation.min', validationOptions, { value: minValue })))
}
