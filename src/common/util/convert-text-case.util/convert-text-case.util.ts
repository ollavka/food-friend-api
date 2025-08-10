import { match } from 'ts-pattern'
import { TextCase } from '@common/enum'
import { capitalize } from '../capitalize.util'
import { ACRONYM_REGEXP, CAMEL_PASCAL_SPLIT_REGEXP, TEXT_CASE_REGEXP } from './constant'
import { ConvertTextCaseOptions, DetectTextCase, TextPart } from './type'

export class TextCaseConverter {
  private static detectTextCase(input: string): DetectTextCase {
    for (const [textCase, regexp] of Object.entries(TEXT_CASE_REGEXP)) {
      if (regexp.test(input)) {
        return { case: textCase as TextCase }
      }
    }

    return {
      case: TextCase.Unknown,
    }
  }

  private static splitIntoParts(source: string, sourceCase: TextCase, acronyms?: Set<string>): TextPart[] {
    const words = match(sourceCase)
      .with(TextCase.Camel, TextCase.Pascal, () => source.match(CAMEL_PASCAL_SPLIT_REGEXP) ?? [source])
      .with(TextCase.Snake, () => source.split('_').filter(Boolean))
      .with(TextCase.Spinal, () => source.split('-').filter(Boolean))
      .with(TextCase.Dot, () => source.split('.').filter(Boolean))
      .with(TextCase.Space, () => source.split(' ').filter(Boolean))
      .otherwise(() => source.match(CAMEL_PASCAL_SPLIT_REGEXP) ?? [source])

    return words.map((word) => ({
      original: word,
      lower: word.toLocaleLowerCase(),
      isAcronym: (acronyms?.has(word) ?? false) || ACRONYM_REGEXP.test(word),
    }))
  }

  private static formatToCase(targetCase: TextCase, parts: TextPart[], preserveAcronyms: boolean): string {
    return match(targetCase)
      .with(TextCase.Camel, () => this.toCamelCase(parts, preserveAcronyms))
      .with(TextCase.Pascal, () => this.toPascalCase(parts, preserveAcronyms))
      .with(TextCase.Snake, () => this.toSnakeCase(parts))
      .with(TextCase.Spinal, () => this.toSpinalCase(parts))
      .with(TextCase.Dot, () => this.toDotCase(parts))
      .with(TextCase.Space, () => this.toSpaceCase(parts))
      .otherwise(() => parts.map((part) => part.original).join(''))
  }

  public static toCamelCase(parts: TextPart[], preserveAcronyms: boolean): string {
    const [first, ...rest] = parts

    return (
      first.lower +
      rest.map((part) => (preserveAcronyms && part.isAcronym ? part.original : capitalize(part.lower))).join('')
    )
  }

  public static toPascalCase(parts: TextPart[], preserveAcronyms: boolean): string {
    return parts.map((part) => (preserveAcronyms && part.isAcronym ? part.original : capitalize(part.lower))).join('')
  }

  public static toSnakeCase(parts: TextPart[]): string {
    return parts.map((part) => part.lower).join('_')
  }

  public static toSpinalCase(parts: TextPart[]): string {
    return parts.map((part) => part.lower).join('-')
  }

  public static toDotCase(parts: TextPart[]): string {
    return parts.map((part) => part.lower).join('.')
  }

  public static toSpaceCase(parts: TextPart[]): string {
    return parts.map((part, idx) => (idx === 0 ? capitalize(part.lower) : part.lower)).join(' ')
  }

  public static convert(text: string, targetCase: `${TextCase}`, options?: ConvertTextCaseOptions): string {
    const { onUnknown = 'return-initial', acronyms } = options ?? {}
    const preserveAcronyms = acronyms?.preserve ?? false
    const detectedCase = this.detectTextCase(text).case

    const sourceCase = match(detectedCase)
      .with(TextCase.Unknown, () =>
        match(onUnknown)
          .with('throw', () => {
            throw new Error('Unknown text case')
          })
          .with('return-initial', () => null)
          .otherwise(() => null),
      )
      .otherwise((textCase) => textCase)

    if (!sourceCase) {
      return text
    }

    const textParts = this.splitIntoParts(text, sourceCase, acronyms?.list)

    return this.formatToCase(targetCase as TextCase, textParts, preserveAcronyms)
  }
}
