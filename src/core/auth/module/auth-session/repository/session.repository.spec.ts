import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AccessControlAuthenticationException } from '@access-control/exception'
import { SessionRepository } from './session.repository'

const USER_ID = '11111111-1111-4111-8111-111111111111'

describe('SessionRepository', () => {
  const prismaService: any = {
    session: {
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  }

  const jwtService: any = {
    verify: jest.fn(),
    sign: jest.fn(),
  }

  let repository: SessionRepository

  beforeEach(() => {
    jest.clearAllMocks()
    jwtService.sign.mockReturnValue('token')
    repository = new SessionRepository(prismaService, jwtService)
  })

  it('should remove refresh tokens by id/hash/user id', async () => {
    await expect(repository.removeRefreshTokenById('token-id')).resolves.toBe(true)
    await expect(repository.removeRefreshTokenByHash('token-hash')).resolves.toBe(true)
    await expect(repository.removeRefreshTokenByUserId(USER_ID)).resolves.toBe(true)

    expect(prismaService.session.deleteMany).toHaveBeenCalledTimes(3)
  })

  it('should validate refresh token and return payload', async () => {
    prismaService.session.findUnique.mockResolvedValue({
      id: 'session-id',
      expiresAt: new Date(Date.now() + 60_000),
    })
    jwtService.verify.mockReturnValue({ id: USER_ID })

    const payload = await repository.validateRefreshToken('refresh-token')

    expect(payload).toEqual({ id: USER_ID })
  })

  it('should reject refresh token when not found, expired or invalid', async () => {
    prismaService.session.findUnique.mockResolvedValueOnce(null)

    await expect(repository.validateRefreshToken('refresh-token')).rejects.toBeInstanceOf(
      AccessControlAuthenticationException,
    )

    prismaService.session.findUnique.mockResolvedValueOnce({
      id: 'session-id',
      expiresAt: new Date(Date.now() - 60_000),
    })

    await expect(repository.validateRefreshToken('refresh-token')).rejects.toBeInstanceOf(
      AccessControlAuthenticationException,
    )

    prismaService.session.findUnique.mockResolvedValueOnce({
      id: 'session-id',
      expiresAt: new Date(Date.now() + 60_000),
    })
    jwtService.verify.mockReturnValueOnce({})

    await expect(repository.validateRefreshToken('refresh-token')).rejects.toBeInstanceOf(
      AccessControlAuthenticationException,
    )
  })

  it('should save refresh token and generate tokens', async () => {
    await repository.saveRefreshToken('refresh-token', USER_ID, '7d')

    expect(prismaService.session.deleteMany).toHaveBeenCalledWith({ where: { userId: USER_ID } })
    expect(prismaService.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tokenHash: expect.any(String),
        isRevoked: false,
        user: {
          connect: { id: USER_ID },
        },
      }),
    })

    const token = repository.generateToken({ id: USER_ID } as never, '15m' as never)
    expect(token).toBe('token')
    expect(jwtService.sign).toHaveBeenCalledWith({ id: USER_ID }, { expiresIn: '15m' })

    const tokens = await repository.generateTokens(
      { id: USER_ID } as never,
      {
        jwtAccessTokenTtl: '15m',
        jwtRefreshTokenTtl: '7d',
      } as never,
    )

    expect(tokens).toEqual({
      accessToken: 'token',
      refreshToken: 'token',
    })
  })
})
