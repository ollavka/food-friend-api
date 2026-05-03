import { describe, expect, it } from '@jest/globals'
import { LanguageCode } from '@prisma/client'
import { UserLanguageResolver } from './user-language.resolver'

describe('UserLanguageResolver', () => {
  it('should resolve language from authenticated user payload', async () => {
    const resolver = new UserLanguageResolver()
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            languageCode: LanguageCode.EN,
          },
        }),
      }),
    }

    const result = await resolver.resolve(context as any)
    expect(result).toBe(LanguageCode.EN)
  })

  it('should return undefined when user has no language', async () => {
    const resolver = new UserLanguageResolver()
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: null,
        }),
      }),
    }

    const result = await resolver.resolve(context as any)
    expect(result).toBeUndefined()
  })
})
