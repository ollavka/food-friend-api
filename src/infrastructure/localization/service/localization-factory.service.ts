import { Injectable, Scope } from '@nestjs/common'
import { NamespacedLocalizer } from '../util'

@Injectable({ scope: Scope.REQUEST })
export class LocalizationFactory {
  public createFor(base: string): NamespacedLocalizer {
    return new NamespacedLocalizer(base)
  }
}
