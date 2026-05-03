import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { OtpCodeStatus, OtpCodeType, UserStatus } from '@prisma/client'
import {
  AppBadRequestException,
  AppConflictException,
  AppEntityNotFoundException,
  AppRateLimitException,
} from '@common/exception'
import { PasswordManagementService } from './password-management.service'

const USER_ID = '11111111-1111-4111-8111-111111111111'
const USER_EMAIL = 'user@example.com'
const TICKET_ID = '22222222-2222-4222-8222-222222222222'

describe('PasswordManagementService', () => {
  const userService: any = {
    findByEmail: jest.fn(),
    update: jest.fn(),
  }

  const bcryptService: any = {
    compare: jest.fn(),
    hash: jest.fn(),
  }

  const otpService: any = {
    confirmCode: jest.fn(),
    findById: jest.fn(),
    validateStatus: jest.fn(),
    generateCode: jest.fn(),
    hashCode: jest.fn(),
    saveCode: jest.fn(),
    update: jest.fn(),
  }

  const mailService: any = {
    canSendMailAfterSeconds: jest.fn(),
    sendResetPasswordMail: jest.fn(),
  }

  const prismaService: any = {
    $transaction: jest.fn(),
  }

  let service: PasswordManagementService

  beforeEach(() => {
    jest.clearAllMocks()

    bcryptService.hash.mockResolvedValue('hashed-password')
    bcryptService.compare.mockResolvedValue(false)
    userService.findByEmail.mockResolvedValue({
      id: USER_ID,
      email: USER_EMAIL,
      firstName: 'John',
      status: UserStatus.ACTIVE,
      password: 'old-hash',
      lastResetPasswordMailSentAt: null,
    })
    otpService.generateCode.mockReturnValue('123456')
    otpService.hashCode.mockReturnValue('hashed-code')
    otpService.saveCode.mockResolvedValue({ id: TICKET_ID })
    otpService.findById.mockResolvedValue({
      id: TICKET_ID,
      status: OtpCodeStatus.CONSUMED,
    })
    otpService.confirmCode.mockResolvedValue({ email: USER_EMAIL, ticket: TICKET_ID, code: '123456' })

    prismaService.$transaction.mockImplementation((callback: (tx: any) => unknown) =>
      callback({
        otpCode: {
          findUnique: (jest.fn() as any).mockResolvedValue({
            id: TICKET_ID,
            status: OtpCodeStatus.CONSUMED,
            user: {
              id: USER_ID,
              email: USER_EMAIL,
              status: UserStatus.ACTIVE,
              password: 'old-hash',
            },
          }),
        },
      }),
    )

    service = new PasswordManagementService(userService, bcryptService, otpService, mailService, prismaService)
  })

  it('should send reset password mail and return ticket', async () => {
    mailService.canSendMailAfterSeconds.mockReturnValue(0)

    const result = await service.sendResetPasswordMail(USER_EMAIL)

    expect(mailService.sendResetPasswordMail).toHaveBeenCalledWith('123456', USER_EMAIL, 'John')
    expect(userService.update).toHaveBeenCalledWith(USER_ID, {
      lastResetPasswordMailSentAt: expect.any(Date),
    })
    expect(result.ticket).toBe(TICKET_ID)
  })

  it('should reject reset password mail when user is missing or rate limited', async () => {
    userService.findByEmail.mockResolvedValueOnce(null)

    await expect(service.sendResetPasswordMail(USER_EMAIL)).rejects.toBeInstanceOf(AppEntityNotFoundException)

    userService.findByEmail.mockResolvedValueOnce({
      id: USER_ID,
      email: USER_EMAIL,
      firstName: 'John',
      status: UserStatus.ACTIVE,
      password: 'old-hash',
      lastResetPasswordMailSentAt: new Date(),
    })
    mailService.canSendMailAfterSeconds.mockReturnValue(20)

    await expect(service.sendResetPasswordMail(USER_EMAIL)).rejects.toBeInstanceOf(AppRateLimitException)
  })

  it('should confirm reset password and activate unverified user', async () => {
    userService.findByEmail.mockResolvedValue({
      id: USER_ID,
      email: USER_EMAIL,
      firstName: 'John',
      status: UserStatus.UNVERIFIED,
      password: 'old-hash',
    })

    const result = await service.confirmResetPassword({ ticket: TICKET_ID, code: '123456' })

    expect(otpService.confirmCode).toHaveBeenCalledWith(TICKET_ID, '123456', OtpCodeType.PASSWORD_RESET)
    expect(userService.update).toHaveBeenCalledWith(USER_ID, { status: UserStatus.ACTIVE }, expect.any(Object))
    expect(result.ticket).toBe(TICKET_ID)
  })

  it('should complete reset password and update password hashes', async () => {
    await service.completeResetPassword({
      ticket: TICKET_ID,
      newPassword: 'NewPassword123!',
    })

    expect(bcryptService.hash).toHaveBeenCalledWith('NewPassword123!')
    expect(userService.update).toHaveBeenCalledWith(USER_ID, { password: 'hashed-password' }, expect.any(Object))
    expect(otpService.update).toHaveBeenCalledWith(TICKET_ID, { status: OtpCodeStatus.USED }, expect.any(Object))
  })

  it('should reject complete reset password if otp ticket is missing', async () => {
    prismaService.$transaction.mockImplementation((callback: (tx: any) => unknown) =>
      callback({
        otpCode: {
          findUnique: (jest.fn() as any).mockResolvedValue(null),
        },
      }),
    )

    await expect(
      service.completeResetPassword({
        ticket: TICKET_ID,
        newPassword: 'NewPassword123!',
      }),
    ).rejects.toBeInstanceOf(AppEntityNotFoundException)
  })

  it('should reject set and change password conflict scenarios', async () => {
    await expect(
      service.setPassword(
        {
          id: USER_ID,
          status: UserStatus.ACTIVE,
          password: 'existing-password',
        } as never,
        'NewPassword123!',
      ),
    ).rejects.toBeInstanceOf(AppConflictException)

    await expect(
      service.changePassword(
        {
          id: USER_ID,
          status: UserStatus.ACTIVE,
          password: null,
        } as never,
        {
          currentPassword: 'old-password',
          newPassword: 'new-password',
        } as never,
      ),
    ).rejects.toBeInstanceOf(AppConflictException)
  })

  it('should reject invalid current password and same password in change flow', async () => {
    bcryptService.compare.mockResolvedValueOnce(false).mockResolvedValueOnce(true)

    await expect(
      service.changePassword(
        {
          id: USER_ID,
          status: UserStatus.ACTIVE,
          password: 'old-password-hash',
        } as never,
        {
          currentPassword: 'wrong-current',
          newPassword: 'new-password',
        } as never,
      ),
    ).rejects.toBeInstanceOf(AppBadRequestException)

    await expect(
      service.changePassword(
        {
          id: USER_ID,
          status: UserStatus.ACTIVE,
          password: 'old-password-hash',
        } as never,
        {
          currentPassword: 'same-password',
          newPassword: 'same-password',
        } as never,
      ),
    ).rejects.toBeInstanceOf(AppBadRequestException)
  })
})
