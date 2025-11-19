import { ValidationOptions } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

type MessageArgs = Record<string, unknown>

export function withI18nMessage(
  key: string,
  validationOptions?: ValidationOptions,
  args?: MessageArgs,
): ValidationOptions {
  if (validationOptions?.message) {
    return validationOptions
  }

  return {
    ...(validationOptions ?? {}),
    message: i18nValidationMessage(key, args),
  }
}
