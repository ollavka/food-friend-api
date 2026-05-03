import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { PasswordManagementController } from './password-management.controller'

describe('PasswordManagementController', () => {
  const passwordManagementService: any = {
    sendResetPasswordMail: jest.fn(),
    confirmResetPassword: jest.fn(),
    completeResetPassword: jest.fn(),
    setPassword: jest.fn(),
    changePassword: jest.fn(),
  }

  const localizationFactory: any = {
    createFor: jest.fn(),
  }

  let controller: PasswordManagementController

  beforeEach(() => {
    jest.clearAllMocks()

    localizationFactory.createFor.mockReturnValue((key: string) => key)
    controller = new PasswordManagementController(passwordManagementService, localizationFactory)
  })

  it('should delegate reset and confirm flows', async () => {
    passwordManagementService.sendResetPasswordMail.mockResolvedValue({ id: 'otp-1' })
    passwordManagementService.confirmResetPassword.mockResolvedValue({ id: 'otp-2' })

    const requestResult = await controller.resetPassword({ email: 'user@example.com' } as never)
    const confirmResult = await controller.confirmResetPassword({ code: '1111' } as never)

    expect(requestResult).toEqual({ id: 'otp-1' })
    expect(confirmResult).toEqual({ id: 'otp-2' })
  })

  it('should return localized messages for complete/set/change password actions', async () => {
    passwordManagementService.completeResetPassword.mockResolvedValue(undefined)
    passwordManagementService.setPassword.mockResolvedValue(undefined)
    passwordManagementService.changePassword.mockResolvedValue(undefined)

    const completed = await controller.completeResetPassword({} as never)
    const set = await controller.setPassword({ id: 'user-1' } as never, { password: 'secret' } as never)
    const changed = await controller.changePassword({ id: 'user-1' } as never, {} as never)

    expect(completed).toEqual({ message: 'password.reset' })
    expect(set).toEqual({ message: 'password.set' })
    expect(changed).toEqual({ message: 'password.change' })
  })
})
