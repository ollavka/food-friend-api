import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AuthProvider, LanguageCode, UserRole, UserStatus } from '@prisma/client'
import { AppBadRequestException } from '@common/exception'
import { GoogleProviderService } from './google-provider.service'

const USER_ID = '11111111-1111-4111-8111-111111111111'

describe('GoogleProviderService', () => {
  const googleAuthClient: any = {
    verifyIdToken: jest.fn(),
  }

  const authSessionService: any = {
    auth: jest.fn(),
  }

  const userService: any = {
    findById: jest.fn(),
    findOrCreate: jest.fn(),
  }

  const providerAccountService: any = {
    findOrCreate: jest.fn(),
    removeAccount: jest.fn(),
  }

  const prismaService: any = {
    $transaction: jest.fn(),
  }

  const languageService: any = {
    getLanguageOrDefault: jest.fn(),
  }

  let service: GoogleProviderService

  beforeEach(() => {
    jest.clearAllMocks()

    languageService.getLanguageOrDefault.mockResolvedValue({ id: 'language-id', code: LanguageCode.EN })
    userService.findOrCreate.mockResolvedValue({
      id: USER_ID,
      email: 'user@example.com',
    })
    providerAccountService.findOrCreate.mockResolvedValue({
      id: 'account-id',
    })
    prismaService.$transaction.mockImplementation((callback: (tx: unknown) => unknown) => callback({}))

    service = new GoogleProviderService(
      googleAuthClient,
      authSessionService,
      userService,
      providerAccountService,
      prismaService,
      languageService,
    )
  })

  it('should authenticate with google id token and return auth response', async () => {
    googleAuthClient.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'subject-id',
        email: 'user@example.com',
        email_verified: true,
        given_name: 'John',
        family_name: 'Doe',
      }),
    })
    authSessionService.auth.mockResolvedValue({ accessToken: 'access-token' })

    const result = await service.googleAuth({} as never, 'id-token', LanguageCode.EN)

    expect(result).toEqual({ accessToken: 'access-token' })
    expect(authSessionService.auth).toHaveBeenCalled()
  })

  it('should link google account through token handler', async () => {
    googleAuthClient.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'subject-id',
        email: 'user@example.com',
        email_verified: true,
      }),
    })

    await service.linkGoogleAccount('id-token', 'user@example.com', LanguageCode.EN)

    expect(providerAccountService.findOrCreate).toHaveBeenCalledWith(
      expect.any(Object),
      AuthProvider.GOOGLE,
      expect.objectContaining({ id: USER_ID }),
      {},
      true,
    )
  })

  it('should ignore unlink when google account does not exist', async () => {
    userService.findById.mockResolvedValue({
      id: USER_ID,
      password: null,
      accounts: [],
    })

    await service.unlinkGoogleAccount(USER_ID as never)

    expect(providerAccountService.removeAccount).not.toHaveBeenCalled()
  })

  it('should unlink account when user has alternative login method', async () => {
    userService.findById.mockResolvedValue({
      id: USER_ID,
      password: 'hashed-password',
      accounts: [{ provider: AuthProvider.GOOGLE }],
    })

    await service.unlinkGoogleAccount(USER_ID as never)

    expect(providerAccountService.removeAccount).toHaveBeenCalledWith(USER_ID, AuthProvider.GOOGLE)
  })

  it('should reject invalid or unverified google payload', async () => {
    googleAuthClient.verifyIdToken.mockRejectedValue(new Error('invalid token'))

    await expect(service.googleAuth({} as never, 'bad-token', LanguageCode.EN)).rejects.toBeInstanceOf(
      AppBadRequestException,
    )

    googleAuthClient.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'subject-id',
        email: 'user@example.com',
        email_verified: false,
      }),
    })

    await expect(service.googleAuth({} as never, 'bad-token', LanguageCode.EN)).rejects.toBeInstanceOf(
      AppBadRequestException,
    )
  })

  it('should pass strict=false for existing account resolution when linking is relaxed', async () => {
    googleAuthClient.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'subject-id',
        email: 'user@example.com',
        email_verified: true,
      }),
    })

    await (service as any).handleGoogleToken(
      {
        idToken: 'id-token',
        userEmail: 'user@example.com',
        languageCode: LanguageCode.EN,
      },
      false,
    )

    expect(userService.findOrCreate).toHaveBeenCalledWith(
      'user@example.com',
      expect.objectContaining({
        status: UserStatus.ACTIVE,
        role: UserRole.REGULAR,
      }),
      {},
    )
    expect(providerAccountService.findOrCreate).toHaveBeenCalledWith(
      expect.any(Object),
      AuthProvider.GOOGLE,
      expect.any(Object),
      {},
      false,
    )
  })
})
