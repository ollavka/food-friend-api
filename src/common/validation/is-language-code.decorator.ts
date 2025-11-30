import { applyDecorators } from '@nestjs/common'
import { LanguageCode } from '@prisma/client'
import { Transform } from 'class-transformer'
import { ValidationOptions } from 'class-validator'
import { normalizeLanguageCode } from '@common/util'
import { IsEnum } from './is-enum.decorator'

export function IsLanguageCode(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) =>
      validationOptions?.each && Array.isArray(value)
        ? value.map((item) => normalizeLanguageCode(item))
        : normalizeLanguageCode(value),
    ),
    IsEnum(LanguageCode, validationOptions),
  )
}
