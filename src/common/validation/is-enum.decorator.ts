import { applyDecorators } from '@nestjs/common'
import { ValidationOptions, IsEnum as _IsEnum } from 'class-validator'
import { withI18nMessage } from './with-i18n-message.util'

export function IsEnum(entity: object, validationOptions?: ValidationOptions): PropertyDecorator {
  const enumObj = entity as Record<string, unknown>
  const values = Object.values(enumObj)
    .filter((value) => typeof value === 'string')
    .join(', ')

  return applyDecorators(_IsEnum(entity, withI18nMessage('validation.enum', validationOptions, { values })))
}
