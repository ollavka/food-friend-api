import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AppEntityNotFoundException } from '@common/exception'
import { AuthSessionService } from './auth-session.service'

const USER_ID = '11111111-1111-4111-8111-111111111111'

describe('AuthSessionService', () => {
  const userService: any = {
    findById: jest.fn(),
  }

  const sessionRepository: any = {
    validateRefreshToken: jest.fn(),
    removeRefreshTokenByHash: jest.fn(),
    generateTokens: jest.fn(),
    saveRefreshToken: jest.fn(),
  }

  const configService: any = {
    get: jest.fn(),
  }

  let service: AuthSessionService

  beforeEach(() => {
    jest.clearAllMocks()

    configService.get.mockReturnValue({
      jwtAccessTokenTtl: '15m',
      jwtRefreshTokenTtl: '7d',
    })

    service = new AuthSessionService(userService, sessionRepository, configService)
  })

  it('should refresh session and return auth response', async () => {
    const req: any = {
      cookies: {
        'refresh-token': 'refresh-token',
      },
    }
    const res: any = {
      clearCookie: jest.fn(),
    }

    sessionRepository.validateRefreshToken.mockResolvedValue({ id: USER_ID })
    userService.findById.mockResolvedValue({ id: USER_ID, status: 'ACTIVE' })
    sessionRepository.generateTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
    sessionRepository.saveRefreshToken.mockResolvedValue(undefined)
    res.cookie = jest.fn()

    const result = await service.refresh(req, res)

    expect(result.accessToken).toBe('access-token')
    expect(res.clearCookie).not.toHaveBeenCalled()
  })

  it('should clear refresh cookie when refresh fails', async () => {
    const req: any = {
      cookies: {
        'refresh-token': 'refresh-token',
      },
    }
    const res: any = {
      clearCookie: jest.fn(),
    }

    sessionRepository.validateRefreshToken.mockResolvedValue({ id: USER_ID })
    userService.findById.mockResolvedValue(null)

    await expect(service.refresh(req, res)).rejects.toBeInstanceOf(AppEntityNotFoundException)
    expect(res.clearCookie).toHaveBeenCalledWith('refresh-token')
  })

  it('should logout by removing refresh token hash and clear cookie', async () => {
    const req: any = {
      cookies: {
        'refresh-token': 'refresh-token',
      },
    }
    const res: any = {
      clearCookie: jest.fn(),
    }

    const result = await service.logout(req, res)

    expect(sessionRepository.removeRefreshTokenByHash).toHaveBeenCalledWith(expect.any(String))
    expect(res.clearCookie).toHaveBeenCalledWith('refresh-token')
    expect(result).toBeNull()
  })

  it('should logout and clear cookie when refresh token is missing', async () => {
    const req: any = {
      cookies: {},
    }
    const res: any = {
      clearCookie: jest.fn(),
    }

    await service.logout(req, res)

    expect(sessionRepository.removeRefreshTokenByHash).not.toHaveBeenCalled()
    expect(res.clearCookie).toHaveBeenCalledWith('refresh-token')
  })

  it('should authenticate user, set cookie and return response model', async () => {
    const res: any = {
      cookie: jest.fn(),
    }
    sessionRepository.generateTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
    sessionRepository.saveRefreshToken.mockResolvedValue(undefined)

    const result = await service.auth(res, {
      id: USER_ID,
      status: 'ACTIVE',
    } as never)

    expect(sessionRepository.generateTokens).toHaveBeenCalled()
    expect(sessionRepository.saveRefreshToken).toHaveBeenCalledWith('refresh-token', USER_ID, '7d')
    expect(res.cookie).toHaveBeenCalledWith(
      'refresh-token',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
      }),
    )
    expect(result.accessToken).toBe('access-token')
  })
})
