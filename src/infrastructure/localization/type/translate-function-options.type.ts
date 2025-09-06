import { TranslateOptions } from 'nestjs-i18n'

export type TranslateFunctionOptions = TranslateOptions & {
  parseHtml?: boolean
}
