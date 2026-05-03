import { describe, expect, it, jest } from '@jest/globals'
import { setupQs } from './setup-qs.config'

describe('setupQs', () => {
  it('should configure custom query parser on http adapter instance', () => {
    const set = jest.fn()
    const app = {
      getHttpAdapter: () => ({
        getInstance: () => ({ set }),
      }),
    }

    setupQs(app as any)

    expect(set).toHaveBeenCalledWith('query parser', expect.any(Function))
    const parser = set.mock.calls[0]?.[1] as (value: string) => Record<string, unknown>
    const parsed = parser('a[b][c]=1&items[0]=x&items[1]=y')

    expect(parsed).toEqual({
      a: { b: { c: '1' } },
      items: ['x', 'y'],
    })
  })
})
