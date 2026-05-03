import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { UserStatus } from '@prisma/client'
import { AccessControlAuthenticationException } from '@access-control/exception'
import { AppConflictException } from '@common/exception'
import { AuthService } from './auth.service'

const USER_ID = '11111111-1111-4111-8111-111111111111'
const USER_EMAIL = 'user@example.com'

describe('AuthService', () => {
  const userService: any = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  }

  const bcryptService: any = {
    hash: jest.fn(),
    compare: jest.fn(),
  }

  const mailService: any = {
    sendWelcomeMail: jest.fn(),
  }

  const authSessionService: any = {
    auth: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
  }

  const emailVerificationService: any = {
    sendVerificationMail: jest.fn(),
  }

  const languageService: any = {
    getLanguageOrDefault: jest.fn(),
  }

  let service: AuthService

  beforeEach(() => {
    jest.clearAllMocks()
    bcryptService.hash.mockResolvedValue('hashed-password')
    languageService.getLanguageOrDefault.mockResolvedValue({ id: 'language-id' })
    userService.create.mockResolvedValue({
      id: USER_ID,
      email: USER_EMAIL,
      firstName: 'John',
      status: UserStatus.UNVERIFIED,
    })
    emailVerificationService.sendVerificationMail.mockResolvedValue({ id: 'otp-ticket-id' })

    service = new AuthService(
      userService,
      bcryptService,
      mailService,
      authSessionService,
      emailVerificationService,
      languageService,
    )
  })

  it('should register user, send welcome mail and return verification ticket', async () => {
    userService.findByEmail.mockResolvedValue(null)

    const ticket = await service.register({
      email: USER_EMAIL,
      firstName: 'John',
      lastName: 'Doe',
      password: 'Password123!',
      languageCode: 'EN',
    } as never)

    expect(userService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: USER_EMAIL,
        password: 'hashed-password',
        status: UserStatus.UNVERIFIED,
      }),
    )
    expect(mailService.sendWelcomeMail).toHaveBeenCalledWith(USER_EMAIL, 'John')
    expect(ticket).toEqual({ id: 'otp-ticket-id' })
  })

  it('should reject registration when email is already taken', async () => {
    userService.findByEmail.mockResolvedValue({ id: USER_ID })

    await expect(
      service.register({
        email: USER_EMAIL,
        firstName: 'John',
        lastName: 'Doe',
      } as never),
    ).rejects.toBeInstanceOf(AppConflictException)
  })

  it('should authenticate valid user credentials', async () => {
    userService.findByEmail.mockResolvedValue({
      id: USER_ID,
      email: USER_EMAIL,
      password: 'hashed-password',
      status: UserStatus.ACTIVE,
    })
    bcryptService.compare.mockResolvedValue(true)
    authSessionService.auth.mockResolvedValue({ accessToken: 'access-token' })

    const result = await service.login(
      {} as never,
      {
        email: USER_EMAIL,
        password: 'Password123!',
      } as never,
    )

    expect(result).toEqual({ accessToken: 'access-token' })
    expect(authSessionService.auth).toHaveBeenCalled()
  })

  it('should reject invalid login credentials', async () => {
    userService.findByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: USER_ID,
      email: USER_EMAIL,
      password: 'hashed-password',
      status: UserStatus.ACTIVE,
    })
    bcryptService.compare.mockResolvedValue(false)

    await expect(
      service.login(
        {} as never,
        {
          email: USER_EMAIL,
          password: 'Password123!',
        } as never,
      ),
    ).rejects.toBeInstanceOf(AccessControlAuthenticationException)

    await expect(
      service.login(
        {} as never,
        {
          email: USER_EMAIL,
          password: 'Password123!',
        } as never,
      ),
    ).rejects.toBeInstanceOf(AccessControlAuthenticationException)
  })

  it('should delegate logout and refresh methods', async () => {
    authSessionService.logout.mockResolvedValue(null)
    authSessionService.refresh.mockResolvedValue({ accessToken: 'new-access-token' })

    const logoutResult = await service.logout({} as never, {} as never)
    const refreshResult = await service.refresh({} as never, {} as never)

    expect(logoutResult).toBeNull()
    expect(refreshResult).toEqual({ accessToken: 'new-access-token' })
  })
})
