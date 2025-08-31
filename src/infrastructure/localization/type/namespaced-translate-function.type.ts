import { TranslateOptions } from 'nestjs-i18n'

export type NamespacedTranslateFunction = (key: string, options?: TranslateOptions) => string
