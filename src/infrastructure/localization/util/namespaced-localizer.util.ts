import parse from 'html-react-parser'
import { I18nContext } from 'nestjs-i18n'
import { HtmlReturn } from '@common/type'
import { TranslateFunctionOptions } from '../type'

export class NamespacedLocalizer {
  public constructor(private readonly base?: string) {}

  private get i18n(): I18nContext<Record<string, unknown>> | never {
    const ctx = I18nContext.current()

    if (!ctx) {
      throw new Error('I18nContext is not available.')
    }

    return ctx
  }

  public t(key: string): string
  public t(key: string, options?: Omit<TranslateFunctionOptions, 'parseHtml'> & { parseHtml?: false }): string
  public t(key: string, options?: Omit<TranslateFunctionOptions, 'parseHtml'> & { parseHtml: true }): HtmlReturn
  public t(key: string, options?: TranslateFunctionOptions): string | HtmlReturn {
    const { parseHtml = false, ...localizationOptions } = options || {}
    const preparedKey = this.base ? `${this.base}.${key}` : key
    const text = <string>this.i18n.t(preparedKey, localizationOptions)
    return parseHtml ? parse(text) : text
  }
}
