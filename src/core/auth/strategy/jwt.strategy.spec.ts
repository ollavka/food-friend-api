import { describe, expect, it, jest } from '@jest/globals'
import { LanguageCode } from '@prisma/client'
import { AppEntityNotFoundException } from '@common/exception'
import { JwtStrategy } from './jwt.strategy'

describe('JwtStrategy', () => {
  const createConfigService = (): any =>
    ({
      get: jest.fn().mockReturnValue({
        jwtSecretKey: 'jwt-secret',
      }),
    }) as any

  it('should return user payload with flattened language code', async () => {
    const configService = createConfigService()
    const findById = jest.fn().mockImplementation(async () => ({
      id: 'user-id',
      email: 'user@example.com',
      language: {
        code: LanguageCode.EN,
      },
    }))
    const userService = { findById }
    const strategy = new JwtStrategy(configService, userService as any)

    const result = await strategy.validate({ id: 'user-id' } as any)

    expect(findById).toHaveBeenCalledWith('user-id', {
      include: {
        language: {
          select: { code: true },
        },
      },
    })
    expect(result).toEqual({
      id: 'user-id',
      email: 'user@example.com',
      languageCode: LanguageCode.EN,
    })
  })

  it('should throw entity not found when user does not exist', async () => {
    const findById = jest.fn().mockImplementation(async () => null)
    const strategy = new JwtStrategy(createConfigService(), {
      findById,
    } as any)

    await expect(strategy.validate({ id: 'missing-user-id' } as any)).rejects.toBeInstanceOf(AppEntityNotFoundException)
  })
})
