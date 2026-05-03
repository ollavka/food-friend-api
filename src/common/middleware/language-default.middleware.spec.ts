import { describe, expect, it, jest } from '@jest/globals'
import { DefaultLanguageMiddleware } from './language-default.middleware'

describe('DefaultLanguageMiddleware', () => {
  it('should assign default language code to request', async () => {
    const languageService: any = {
      getDefaultLanguage: jest.fn(),
    }

    ;(languageService.getDefaultLanguage as any).mockResolvedValue({ code: 'EN' })

    const middleware = new DefaultLanguageMiddleware(languageService)
    const req: any = {}
    const next = jest.fn()

    await middleware.use(req, {} as never, next)

    expect(req.defaultLanguageCode).toBe('EN')
    expect(next).toHaveBeenCalledTimes(1)
  })
})
