import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'

const flushAsync = async (): Promise<void> => {
  await new Promise((resolve) => setImmediate(resolve))
  await new Promise((resolve) => setImmediate(resolve))
}

describe('seed entry script', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://localhost:5432/food_friend_test',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should run all seed pipelines and close resources on success', async () => {
    const poolEndMock = jest.fn(() => Promise.resolve())
    const poolMock = { end: poolEndMock }
    const poolCtorMock = jest.fn(() => poolMock)

    const prismaDisconnectMock = jest.fn(() => Promise.resolve())
    const prismaMock = { $disconnect: prismaDisconnectMock }
    const prismaClientCtorMock = jest.fn(() => prismaMock)
    const prismaPgCtorMock = jest.fn(() => ({}))

    const seedLanguagesMock = jest.fn(() =>
      Promise.resolve({
        EN: { id: 'language-EN' },
        UK: { id: 'language-UK' },
      }),
    )
    const seedMeasurementBaseTypesMock = jest.fn(() =>
      Promise.resolve({
        MASS: { id: 'base-MASS' },
        VOLUME: { id: 'base-VOLUME' },
        COUNT: { id: 'base-COUNT' },
      }),
    )
    const seedMeasurementUnitsMock = jest.fn(() => Promise.resolve({}))
    const seedProductsMock = jest.fn(() => Promise.resolve({}))
    const seedRecipeDifficultiesMock = jest.fn(() => Promise.resolve({}))
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    jest.doMock('pg', () => ({ Pool: poolCtorMock }))
    jest.doMock('@prisma/client', () => ({ PrismaClient: prismaClientCtorMock }))
    jest.doMock('@prisma/adapter-pg', () => ({ PrismaPg: prismaPgCtorMock }))
    jest.doMock('./languages/seed', () => ({ seedLanguages: seedLanguagesMock }))
    jest.doMock('./measurement-base-type/seed', () => ({
      seedMeasurementBaseTypes: seedMeasurementBaseTypesMock,
    }))
    jest.doMock('./measurement-unit/seed', () => ({ seedMeasurementUnits: seedMeasurementUnitsMock }))
    jest.doMock('./product/seed', () => ({ seedProducts: seedProductsMock }))
    jest.doMock('./recipe-difficulty/seed', () => ({
      seedRecipeDifficulties: seedRecipeDifficultiesMock,
    }))

    await import('./seed')
    await flushAsync()

    expect(poolCtorMock).toHaveBeenCalledWith({
      connectionString: process.env.DATABASE_URL,
    })
    expect(prismaPgCtorMock).toHaveBeenCalledWith(poolMock)
    expect(seedLanguagesMock).toHaveBeenCalledWith(prismaMock)
    expect(seedMeasurementBaseTypesMock).toHaveBeenCalledWith(
      prismaMock,
      expect.objectContaining({
        EN: expect.objectContaining({ id: 'language-EN' }),
        UK: expect.objectContaining({ id: 'language-UK' }),
      }),
    )
    expect(seedMeasurementUnitsMock).toHaveBeenCalled()
    expect(seedProductsMock).toHaveBeenCalled()
    expect(seedRecipeDifficultiesMock).toHaveBeenCalled()
    expect(prismaDisconnectMock).toHaveBeenCalledTimes(1)
    expect(poolEndMock).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledWith('All seeds completed ✅')
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  it('should log failure and exit process when any seed step throws', async () => {
    const poolEndMock = jest.fn(() => Promise.resolve())
    const poolMock = { end: poolEndMock }
    const poolCtorMock = jest.fn(() => poolMock)

    const prismaDisconnectMock = jest.fn(() => Promise.resolve())
    const prismaMock = { $disconnect: prismaDisconnectMock }
    const prismaClientCtorMock = jest.fn(() => prismaMock)
    const prismaPgCtorMock = jest.fn(() => ({}))

    const seedLanguagesError = new Error('seed languages failed')
    const seedLanguagesMock = jest.fn(() => Promise.reject(seedLanguagesError))
    const seedMeasurementBaseTypesMock = jest.fn(() => Promise.resolve({}))
    const seedMeasurementUnitsMock = jest.fn(() => Promise.resolve({}))
    const seedProductsMock = jest.fn(() => Promise.resolve({}))
    const seedRecipeDifficultiesMock = jest.fn(() => Promise.resolve({}))

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never)

    jest.doMock('pg', () => ({ Pool: poolCtorMock }))
    jest.doMock('@prisma/client', () => ({ PrismaClient: prismaClientCtorMock }))
    jest.doMock('@prisma/adapter-pg', () => ({ PrismaPg: prismaPgCtorMock }))
    jest.doMock('./languages/seed', () => ({ seedLanguages: seedLanguagesMock }))
    jest.doMock('./measurement-base-type/seed', () => ({
      seedMeasurementBaseTypes: seedMeasurementBaseTypesMock,
    }))
    jest.doMock('./measurement-unit/seed', () => ({ seedMeasurementUnits: seedMeasurementUnitsMock }))
    jest.doMock('./product/seed', () => ({ seedProducts: seedProductsMock }))
    jest.doMock('./recipe-difficulty/seed', () => ({
      seedRecipeDifficulties: seedRecipeDifficultiesMock,
    }))

    await import('./seed')
    await flushAsync()

    expect(seedLanguagesMock).toHaveBeenCalledTimes(1)
    expect(seedMeasurementBaseTypesMock).not.toHaveBeenCalled()
    expect(prismaDisconnectMock).toHaveBeenCalledTimes(1)
    expect(poolEndMock).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Seed failed ❌', seedLanguagesError)
    expect(exitSpy).toHaveBeenCalledWith(1)
  })
})
