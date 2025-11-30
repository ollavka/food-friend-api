import { applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiQuery } from '@nestjs/swagger'
import { LanguageCode } from '@prisma/client'

export function ApiLanguage(): MethodDecorator {
  return applyDecorators(
    ApiQuery({
      name: 'lang',
      required: false,
      description:
        'Optional language override. Highest priority.\n\n' +
        'Language resolution order:\n' +
        '1) Query parameter: ?lang\n' +
        '2) Header: x-lang\n' +
        '3) Authenticated user language\n' +
        '4) Default language (Ukrainian – uk)\n\n' +
        'The value is case-insensitive and may be either:\n' +
        '- a plain language code (e.g. "en", "EN", "uk")\n' +
        '- a locale code (e.g. "en-US", "EN_us", "uk-UA")\n\n' +
        'The value will be normalized internally to a supported LanguageCode.',
      schema: {
        enum: Object.values(LanguageCode),
        default: LanguageCode.UK,
      },
    }),
    ApiHeader({
      name: 'x-lang',
      required: false,
      description:
        'Optional language override. Lower priority than ?lang.\n\n' +
        'Language resolution order:\n' +
        '1) Query parameter: ?lang\n' +
        '2) Header: x-lang\n' +
        '3) Authenticated user language\n' +
        '4) Default language (Ukrainian – uk)\n\n' +
        'The value is case-insensitive and may be either:\n' +
        '- a plain language code (e.g. "en", "EN", "uk")\n' +
        '- a locale code (e.g. "en-US", "EN_us", "uk-UA")\n\n' +
        'The value will be normalized internally to a supported LanguageCode.',
      schema: {
        enum: Object.values(LanguageCode),
        default: LanguageCode.UK,
      },
    }),
  )
}
