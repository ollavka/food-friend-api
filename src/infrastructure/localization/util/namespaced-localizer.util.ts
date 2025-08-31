import parse from 'html-react-parser'
import { I18nContext } from 'nestjs-i18n'
import { NamespacedTranslateFunction, NamespacedTranslateHtmlFunction } from '../type'

export class NamespacedLocalizer {
  public constructor(private readonly base: string) {}

  private get i18n(): I18nContext<Record<string, unknown>> | never {
    const ctx = I18nContext.current()

    if (!ctx) {
      throw new Error('I18nContext is not available.')
    }

    return ctx
  }

  public t: NamespacedTranslateFunction = (key, options) => {
    const text = this.i18n.t(`${this.base}.${key}`, options)
    return text
  }

  public tHtml: NamespacedTranslateHtmlFunction = (key, options) => {
    const text = this.i18n.t(`${this.base}.${key}`, options)
    return parse(text)
  }
}
