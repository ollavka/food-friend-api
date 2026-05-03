import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'

describe('hash-to-uuid script', () => {
  const originalArgv = process.argv

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.argv = originalArgv
  })

  it('should print error and exit when hash argument is missing', async () => {
    process.argv = ['node', 'hash-to-uuid.script.ts']

    const isHashMock = jest.fn()
    const hashToUuidMock = jest.fn()
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('EXIT')
    }) as never)

    jest.doMock('@common/util', () => ({
      isHash: isHashMock,
      hashToUuid: hashToUuidMock,
    }))

    await expect(import('./hash-to-uuid.script')).rejects.toThrow('EXIT')

    expect(consoleErrorSpy).toHaveBeenCalledWith('Hash argument is required.')
    expect(processExitSpy).toHaveBeenCalled()
    expect(isHashMock).not.toHaveBeenCalled()
    expect(hashToUuidMock).not.toHaveBeenCalled()
  })

  it('should print error and exit when hash argument is invalid', async () => {
    process.argv = ['node', 'hash-to-uuid.script.ts', 'invalid-hash']

    const isHashMock = jest.fn(() => false)
    const hashToUuidMock = jest.fn()
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('EXIT')
    }) as never)

    jest.doMock('@common/util', () => ({
      isHash: isHashMock,
      hashToUuid: hashToUuidMock,
    }))

    await expect(import('./hash-to-uuid.script')).rejects.toThrow('EXIT')

    expect(isHashMock).toHaveBeenCalledWith('invalid-hash')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Hash is invalid.')
    expect(processExitSpy).toHaveBeenCalled()
    expect(hashToUuidMock).not.toHaveBeenCalled()
  })

  it('should print uuid for valid hash argument', async () => {
    process.argv = ['node', 'hash-to-uuid.script.ts', 'valid-hash']

    const isHashMock = jest.fn(() => true)
    const hashToUuidMock = jest.fn(() => '11111111-1111-4111-8111-111111111111')
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('EXIT')
    }) as never)

    jest.doMock('@common/util', () => ({
      isHash: isHashMock,
      hashToUuid: hashToUuidMock,
    }))

    await import('./hash-to-uuid.script')

    expect(isHashMock).toHaveBeenCalledWith('valid-hash')
    expect(hashToUuidMock).toHaveBeenCalledWith('valid-hash')
    expect(consoleWarnSpy).toHaveBeenCalledWith('UUID:', '11111111-1111-4111-8111-111111111111')
    expect(processExitSpy).not.toHaveBeenCalled()
  })
})
