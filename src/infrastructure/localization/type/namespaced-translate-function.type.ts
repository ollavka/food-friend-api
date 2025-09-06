import { domToReact } from 'html-react-parser'
import { TranslateFunctionOptions } from './translate-function-options.type'

export type NamespacedTranslateFunction = <T extends TranslateFunctionOptions>(
  key: string,
  options?: T,
) => T extends { parseHtml: true } ? ReturnType<typeof domToReact> : string
