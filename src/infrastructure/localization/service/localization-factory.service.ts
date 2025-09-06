import { Injectable, Scope } from '@nestjs/common'
import { NamespacedTranslateFunction, TranslateFunctionOptions } from '../type'
import { NamespacedLocalizer } from '../util'

@Injectable({ scope: Scope.REQUEST })
export class LocalizationFactory {
  public createFor(base?: string | null, defaultOptions?: TranslateFunctionOptions): NamespacedTranslateFunction {
    const localizer = new NamespacedLocalizer(base ?? '', defaultOptions ?? {})
    return localizer.t.bind(localizer)
  }
}
