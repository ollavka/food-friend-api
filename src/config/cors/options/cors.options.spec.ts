import { describe, expect, it, jest } from '@jest/globals'
import { getCorsOptions } from './cors.options'

describe('getCorsOptions', () => {
  it('should allow request when origin is empty', () => {
    const options = getCorsOptions(['https://app.local'])
    const callback = jest.fn()
    const originHandler = options.origin as (
      origin: string | undefined,
      callback: (error: Error | null, allow: boolean) => void,
    ) => void

    originHandler(undefined, callback)

    expect(callback).toHaveBeenCalledWith(null, true)
  })

  it('should allow request when origin is in allow list', () => {
    const options = getCorsOptions(['https://app.local'])
    const callback = jest.fn()
    const originHandler = options.origin as (
      origin: string | undefined,
      callback: (error: Error | null, allow: boolean) => void,
    ) => void

    originHandler('https://app.local', callback)

    expect(callback).toHaveBeenCalledWith(null, true)
  })

  it('should reject request when origin is not in allow list', () => {
    const options = getCorsOptions(['https://app.local'])
    const callback = jest.fn()
    const originHandler = options.origin as (
      origin: string | undefined,
      callback: (error: Error | null, allow: boolean) => void,
    ) => void

    originHandler('https://evil.local', callback)

    expect(callback).toHaveBeenCalledWith(expect.any(Error), false)
    expect((callback.mock.calls[0]?.[0] as Error).message).toContain('https://evil.local')
  })
})
