import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'

describe('uuid-to-hash script', () => {
  const originalArgv = process.argv

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.argv = originalArgv
  })

  it('should print error and exit when uuid argument is missing', async () => {
    process.argv = ['node', 'uuid-to-hash.script.ts']

    const isUuidMock = jest.fn()
    const uuidToHashMock = jest.fn()
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('EXIT')
    }) as never)

    jest.doMock('class-validator', () => ({ isUUID: isUuidMock }))
    jest.doMock('@common/util', () => ({ uuidToHash: uuidToHashMock }))

    await expect(import('./uuid-to-hash.script')).rejects.toThrow('EXIT')

    expect(consoleErrorSpy).toHaveBeenCalledWith('UUID argument is required.')
    expect(processExitSpy).toHaveBeenCalled()
    expect(isUuidMock).not.toHaveBeenCalled()
    expect(uuidToHashMock).not.toHaveBeenCalled()
  })

  it('should print error and exit when uuid argument is invalid', async () => {
    process.argv = ['node', 'uuid-to-hash.script.ts', 'invalid-uuid']

    const isUuidMock = jest.fn(() => false)
    const uuidToHashMock = jest.fn()
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('EXIT')
    }) as never)

    jest.doMock('class-validator', () => ({ isUUID: isUuidMock }))
    jest.doMock('@common/util', () => ({ uuidToHash: uuidToHashMock }))

    await expect(import('./uuid-to-hash.script')).rejects.toThrow('EXIT')

    expect(isUuidMock).toHaveBeenCalledWith('invalid-uuid')
    expect(consoleErrorSpy).toHaveBeenCalledWith('UUID is invalid.')
    expect(processExitSpy).toHaveBeenCalled()
    expect(uuidToHashMock).not.toHaveBeenCalled()
  })

  it('should print hash for valid uuid argument', async () => {
    process.argv = ['node', 'uuid-to-hash.script.ts', '11111111-1111-4111-8111-111111111111']

    const isUuidMock = jest.fn(() => true)
    const uuidToHashMock = jest.fn(() => 'valid-hash')
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('EXIT')
    }) as never)

    jest.doMock('class-validator', () => ({ isUUID: isUuidMock }))
    jest.doMock('@common/util', () => ({ uuidToHash: uuidToHashMock }))

    await import('./uuid-to-hash.script')

    expect(isUuidMock).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111')
    expect(uuidToHashMock).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111')
    expect(consoleWarnSpy).toHaveBeenCalledWith('Hash:', 'valid-hash')
    expect(processExitSpy).not.toHaveBeenCalled()
  })
})
