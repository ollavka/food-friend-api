import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Exception } from '@common/exception'
import { AppExceptionFilter } from './app-exception.filter'

describe('AppExceptionFilter', () => {
  const setNodeEnv = (value: string): void => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value,
      configurable: true,
    })
  }

  let filter: AppExceptionFilter

  beforeEach(() => {
    filter = new AppExceptionFilter()
  })

  it('should hide internal message outside development mode', () => {
    setNodeEnv('production')

    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    }

    const error = new Exception('Sensitive internal error', {
      type: 'internal.ai.provider-request',
    })

    filter.catch(error, host as never)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({
          type: 'internal.ai.provider-request',
          message:
            'Internal error occurred. Please contact Food Friend support for more information regarding further actions.',
        }),
      }),
    )
  })

  it('should expose internal details in development mode', () => {
    setNodeEnv('development')

    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    }

    const error = new Exception('Sensitive internal error', {
      type: 'internal.ai.provider-request',
      details: { reason: 'network timeout' },
    })

    filter.catch(error, host as never)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Sensitive internal error',
          details: expect.objectContaining({ reason: 'network timeout' }),
          trace: expect.any(Array),
        }),
      }),
    )
  })

  it('should normalize unknown non-error values', () => {
    setNodeEnv('production')

    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    }

    filter.catch('unexpected' as never, host as never)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message:
            'Internal error occurred. Please contact Food Friend support for more information regarding further actions.',
        }),
      }),
    )
  })
})
