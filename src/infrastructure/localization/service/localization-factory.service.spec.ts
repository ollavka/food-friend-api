import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { I18nContext } from 'nestjs-i18n'
import { LocalizationFactory } from './localization-factory.service'

describe('LocalizationFactory', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create namespaced translate function', () => {
    jest.spyOn(I18nContext, 'current').mockReturnValue({
      t: (key: string) => key,
    } as never)

    const factory = new LocalizationFactory()
    const t = factory.createFor('errors')

    expect(t('forbidden')).toBe('errors.forbidden')
  })
})
