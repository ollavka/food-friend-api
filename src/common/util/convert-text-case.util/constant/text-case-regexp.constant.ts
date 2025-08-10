import { TextCase } from '@common/enum'

export const TEXT_CASE_REGEXP: Record<TextCase, RegExp> = {
  [TextCase.Camel]: /^[\p{Ll}][\p{Ll}\p{N}]*(?:[\p{Lu}][\p{Ll}\p{N}]*)*$/u,
  [TextCase.Pascal]: /^[\p{Lu}][\p{Ll}\p{N}]*(?:[\p{Lu}][\p{Ll}\p{N}]*)*$/u,
  [TextCase.Snake]: /^[\p{L}\p{N}]+(?:_[\p{L}\p{N}]+)+$/u,
  [TextCase.Spinal]: /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+$/u,
  [TextCase.Dot]: /^[\p{L}\p{N}]+(?:\.[\p{L}\p{N}]+)+$/u,
  [TextCase.Space]: /^[\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+)+$/u,
  [TextCase.Unknown]: /^.*$/su,
} as const
