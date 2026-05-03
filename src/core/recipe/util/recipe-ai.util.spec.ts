import { describe, expect, it } from '@jest/globals'
import { LanguageCode, MeasurementUnitKey, RecipeDifficultyKey } from '@prisma/client'
import {
  buildRecipeImagePrompt,
  extractRecipeFileNameFromUrl,
  getImageExtensionByContentType,
  ingredientMatchKey,
  normalizeIngredientName,
  normalizeIngredientQuantity,
  normalizeRecipeFromPhotoOutput,
  slugifyForMatching,
} from './recipe-ai.util'

describe('recipe-ai util', () => {
  it('should build recipe image prompt with language and fallback message', () => {
    const prompt = buildRecipeImagePrompt({
      title: 'Borscht',
      description: 'Classic soup',
      steps: ['Cut vegetables', 'Boil'],
      languageCode: LanguageCode.UK,
    })

    expect(prompt).toContain('Language: Ukrainian.')
    expect(prompt).toContain('Title: Borscht')
    expect(prompt).toContain('Additional request: Use neutral composition and natural lighting.')
  })

  it('should normalize recipe from photo output', () => {
    const output = normalizeRecipeFromPhotoOutput({
      title: 'Salad',
      description: 'Fresh',
      difficulty: RecipeDifficultyKey.EASY,
      cookingTimeMinutes: 15,
      servings: 2,
      steps: ['Chop', 'Mix'],
      ingredients: [
        {
          name: 'Tomato',
          quantity: 2,
          measurementUnitKey: MeasurementUnitKey.PC,
          note: 'ripe',
        },
      ],
      nutrition: {
        kcal: 250,
      },
    })

    expect(output.title).toBe('Salad')
    expect(output.ingredients[0].measurementUnitKey).toBe(MeasurementUnitKey.PC)
    expect(output.nutrition?.kcal).toBe(250)
  })

  it('should throw when ingredients are missing', () => {
    expect(() =>
      normalizeRecipeFromPhotoOutput({
        title: 'Salad',
        difficulty: RecipeDifficultyKey.EASY,
        cookingTimeMinutes: 15,
        steps: ['Chop'],
        ingredients: [],
      }),
    ).toThrow('ingredients')
  })

  it('should resolve image extensions and names', () => {
    expect(getImageExtensionByContentType('image/png')).toBe('png')
    expect(getImageExtensionByContentType('image/unknown')).toBe('jpg')

    const fromPath = extractRecipeFileNameFromUrl(new URL('https://example.com/photo.png'), 'image/png', 'fallback')
    const fallback = extractRecipeFileNameFromUrl(new URL('https://example.com/image'), 'image/png', 'fallback')

    expect(fromPath).toBe('photo.png')
    expect(fallback).toBe('fallback.png')
  })

  it('should normalize ingredient helper values', () => {
    expect(normalizeIngredientName('  Milk  ')).toBe('Milk')
    expect(ingredientMatchKey(' Milk ')).toBe('milk')
    expect(slugifyForMatching('Fresh Milk')).toBe('fresh-milk')
    expect(normalizeIngredientQuantity(0)).toBe(1)
    expect(normalizeIngredientQuantity(2.5)).toBe(2.5)
  })
})
