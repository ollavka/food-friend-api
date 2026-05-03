import { describe, expect, it } from '@jest/globals'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { LanguageCode } from '@prisma/client'
import { Language } from './language.decorator'

class LanguageDecoratorTestController {
  public withFallback(@Language({ fallback: LanguageCode.EN }) _languageCode: LanguageCode): void {}
}

describe('Language decorator', () => {
  const getFactory = (): any => {
    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, LanguageDecoratorTestController, 'withFallback')
    const values = Object.values(metadata ?? {}) as Array<{ factory?: unknown }>
    return values[0]?.factory
  }

  const createContext = (request: Record<string, unknown>): any =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as any

  it('should resolve language from query value', () => {
    const factory = getFactory()
    const result = factory({ fallback: LanguageCode.EN }, createContext({ query: { lang: 'uk' }, headers: {} }))

    expect(result).toBe(LanguageCode.UK)
  })

  it('should return fallback language when request has no language variants', () => {
    const factory = getFactory()
    const result = factory(
      { fallback: LanguageCode.EN },
      createContext({ query: {}, headers: {}, user: null, defaultLanguageCode: LanguageCode.UK }),
    )

    expect(result).toBe(LanguageCode.EN)
  })
})
