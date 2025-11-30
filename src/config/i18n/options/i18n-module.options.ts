import * as path from 'path'
import { HeaderResolver, I18nOptions, QueryResolver } from 'nestjs-i18n'
import { UserLanguageResolver } from '../resolver'

export const I18nModuleOptions: I18nOptions = {
  fallbackLanguage: 'uk',
  fallbacks: { 'ua-*': 'uk', 'uk-*': 'uk', 'en-*': 'en' },
  loaderOptions: {
    path: path.resolve(process.cwd(), 'src/i18n'),
    watch: true,
  },
  throwOnMissingKey: true,
  resolvers: [{ use: QueryResolver, options: ['lang'] }, new HeaderResolver(['x-lang']), UserLanguageResolver],
}
