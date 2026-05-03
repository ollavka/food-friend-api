import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { OtpCodeStatus, OtpCodeType, UserStatus } from '@prisma/client'
import { AppBadRequestException, AppEntityNotFoundException, AppRateLimitException } from '@common/exception'
import { EmailVerificationService } from './email-verification.service'

const USER_ID = '11111111-1111-4111-8111-111111111111'
const USER_EMAIL = 'user@example.com'
const TICKET_ID = '22222222-2222-4222-8222-222222222222'

describe('EmailVerificationService', () => {
  const mailService: any = {
    canSendMailAfterSeconds: jest.fn(),
    sendVerificationEmailMail: jest.fn(),
  }

  const otpService: any = {
    generateCode: jest.fn(),
    hashCode: jest.fn(),
    saveCode: jest.fn(),
    confirmCode: jest.fn(),
    findById: jest.fn(),
    validateStatus: jest.fn(),
    update: jest.fn(),
  }

  const userService: any = {
    findByEmail: jest.fn(),
    update: jest.fn(),
  }

  const prismaService: any = {
    $transaction: jest.fn(),
  }

  const authSessionService: any = {
    auth: jest.fn(),
  }

  let service: EmailVerificationService

  beforeEach(() => {
    jest.clearAllMocks()

    userService.findByEmail.mockResolvedValue({
      id: USER_ID,
      email: USER_EMAIL,
      firstName: 'John',
      status: UserStatus.UNVERIFIED,
      lastEmailVerificationMailSentAt: null,
    })

    otpService.generateCode.mockReturnValue('123456')
    otpService.hashCode.mockReturnValue('hashed-code')
    otpService.saveCode.mockResolvedValue({ id: TICKET_ID })

    prismaService.$transaction.mockImplementation((callback: (tx: unknown) => unknown) => callback({}))

    service = new EmailVerificationService(mailService, otpService, userService, prismaService, authSessionService)
  })

  it('should send verification mail and return ticket', async () => {
    mailService.canSendMailAfterSeconds.mockReturnValue(0)

    const result = await service.sendVerificationMail(USER_EMAIL)

    expect(mailService.sendVerificationEmailMail).toHaveBeenCalledWith('123456', USER_EMAIL, 'John')
    expect(userService.update).toHaveBeenCalledWith(USER_ID, {
      lastEmailVerificationMailSentAt: expect.any(Date),
    })
    expect(result.ticket).toBe(TICKET_ID)
  })

  it('should throw when user does not exist or mail is rate-limited', async () => {
    userService.findByEmail.mockResolvedValueOnce(null)

    await expect(service.sendVerificationMail(USER_EMAIL)).rejects.toBeInstanceOf(AppEntityNotFoundException)

    userService.findByEmail.mockResolvedValueOnce({
      id: USER_ID,
      email: USER_EMAIL,
      status: UserStatus.UNVERIFIED,
      firstName: 'John',
      lastEmailVerificationMailSentAt: new Date(),
    })
    mailService.canSendMailAfterSeconds.mockReturnValue(30)

    await expect(service.sendVerificationMail(USER_EMAIL)).rejects.toBeInstanceOf(AppRateLimitException)
  })

  it('should reject already confirmed user when checkUser=true', async () => {
    userService.findByEmail.mockResolvedValue({
      id: USER_ID,
      email: USER_EMAIL,
      status: UserStatus.ACTIVE,
      firstName: 'John',
      lastEmailVerificationMailSentAt: null,
    })
    mailService.canSendMailAfterSeconds.mockReturnValue(0)

    await expect(service.sendVerificationMail(USER_EMAIL, true)).rejects.toBeInstanceOf(AppBadRequestException)
  })

  it('should confirm email and optionally authenticate user', async () => {
    otpService.confirmCode.mockResolvedValue({ email: USER_EMAIL, ticket: TICKET_ID, code: '123456' })
    otpService.findById.mockResolvedValue({
      id: TICKET_ID,
      status: OtpCodeStatus.CONSUMED,
    })
    userService.findByEmail.mockResolvedValue({
      id: USER_ID,
      email: USER_EMAIL,
      status: UserStatus.UNVERIFIED,
    })
    userService.update.mockResolvedValue({
      id: USER_ID,
      email: USER_EMAIL,
      status: UserStatus.ACTIVE,
    })
    authSessionService.auth.mockResolvedValue({ accessToken: 'access-token' })

    const authResult = await service.confirmEmail(
      {} as never,
      {
        ticket: TICKET_ID,
        code: '123456',
      },
      true,
    )

    expect(otpService.confirmCode).toHaveBeenCalledWith(TICKET_ID, '123456', OtpCodeType.EMAIL_VERIFICATION)
    expect(otpService.update).toHaveBeenCalledWith(TICKET_ID, { status: OtpCodeStatus.USED }, {})
    expect(authResult).toEqual({ accessToken: 'access-token' })
  })
})
