import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { EmailVerificationController } from './email-verification.controller'

describe('EmailVerificationController', () => {
  const emailVerificationService: any = {
    sendVerificationMail: jest.fn(),
    confirmEmail: jest.fn(),
  }

  const localizationFactory: any = {
    createFor: jest.fn(),
  }

  let controller: EmailVerificationController

  beforeEach(() => {
    jest.clearAllMocks()

    localizationFactory.createFor.mockReturnValue((key: string) => {
      if (key === 'email.confirmed') {
        return 'Email confirmed.'
      }

      return key
    })

    controller = new EmailVerificationController(emailVerificationService, localizationFactory)
  })

  it('should delegate sendVerificationMail', async () => {
    emailVerificationService.sendVerificationMail.mockResolvedValue({ id: 'otp-1' })

    const result = await controller.sendVerificationMail({ email: 'user@example.com' } as never)

    expect(result).toEqual({ id: 'otp-1' })
    expect(emailVerificationService.sendVerificationMail).toHaveBeenCalledWith('user@example.com')
  })

  it('should return auth model when confirmEmail returns auth payload', async () => {
    emailVerificationService.confirmEmail.mockResolvedValue({ accessToken: 'token' })

    const result = await controller.confirmEmail({} as never, { code: '1234' } as never, null as never)

    expect(result).toEqual({ accessToken: 'token' })
  })

  it('should return success message when confirmEmail returns null', async () => {
    emailVerificationService.confirmEmail.mockResolvedValue(null)

    const result = await controller.confirmEmail({} as never, { code: '1234' } as never, { id: 'user-1' } as never)

    expect(result).toEqual({ message: 'Email confirmed.' })
  })
})
