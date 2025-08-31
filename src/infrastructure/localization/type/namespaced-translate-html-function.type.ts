import { TranslateOptions } from 'nestjs-i18n'
import React from 'react'

export type NamespacedTranslateHtmlFunction = (
  key: string,
  options?: TranslateOptions,
) => string | React.JSX.Element | React.JSX.Element[]
