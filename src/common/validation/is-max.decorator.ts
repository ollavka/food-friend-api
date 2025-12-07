import { applyDecorators } from '@nestjs/common'
import { Max, ValidationOptions } from 'class-validator'
import { withI18nMessage } from './with-i18n-message.util'

export function IsMax(maxValue: number, validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(Max(maxValue, withI18nMessage('validation.max', validationOptions, { value: maxValue })))
}
