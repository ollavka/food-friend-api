import { describe, expect, it } from '@jest/globals'
import { TextCase } from '@common/enum'
import { TextCaseConverter } from './convert-text-case.util'

describe('TextCaseConverter', () => {
  it('should convert snake and spinal values to camel and pascal', () => {
    expect(TextCaseConverter.convert('recipe_title', TextCase.Camel)).toBe('recipeTitle')
    expect(TextCaseConverter.convert('recipe-title', TextCase.Pascal)).toBe('RecipeTitle')
  })

  it('should convert camel to snake and space case', () => {
    expect(TextCaseConverter.convert('recipeTitle', TextCase.Snake)).toBe('recipe_title')
    expect(TextCaseConverter.convert('recipeTitle', TextCase.Space)).toBe('Recipe title')
  })

  it('should preserve acronyms when configured', () => {
    const result = TextCaseConverter.convert('api_response_time', TextCase.Pascal, {
      acronyms: {
        preserve: true,
        list: new Set(['api']),
      },
    })

    expect(result).toBe('apiResponseTime')
  })

  it('should return initial value on unknown case by default', () => {
    const result = TextCaseConverter.convert('hello@world', TextCase.Snake)

    expect(result).toBe('hello@world')
  })

  it('should throw on unknown case when configured', () => {
    expect(() =>
      TextCaseConverter.convert('hello@world', TextCase.Camel, {
        onUnknown: 'throw',
      }),
    ).toThrow('Unknown text case')
  })
})
