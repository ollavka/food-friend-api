import { applyDecorators } from '@nestjs/common'
import { ValidationOptions, IsEnum as _IsEnum } from 'class-validator'
import { withI18nMessage } from './with-i18n-message.util'

export function IsEnum(enumObj: Record<string, unknown>, validationOptions?: ValidationOptions): PropertyDecorator {
  const values = Object.values(enumObj)
    .filter((value) => typeof value === 'string')
    .join(', ')

  return applyDecorators(_IsEnum(enumObj, withI18nMessage('validation.availableValues', validationOptions, { values })))
}
