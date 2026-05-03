import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AuthController } from './auth.controller'

describe('AuthController', () => {
  const authService: any = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
  }

  let controller: AuthController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new AuthController(authService)
  })

  it('should delegate register/login/logout/refresh', async () => {
    authService.register.mockResolvedValue({ id: 'otp-1' })
    authService.login.mockResolvedValue({ accessToken: 'token' })
    authService.logout.mockResolvedValue(null)
    authService.refresh.mockResolvedValue({ accessToken: 'token-2' })

    const response: any = {}
    const request: any = {}

    await controller.register({ email: 'user@example.com' } as never)
    await controller.login(response, { email: 'user@example.com', password: '123' } as never)
    await controller.logout(request, response)
    await controller.refresh(request, response)

    expect(authService.register).toHaveBeenCalled()
    expect(authService.login).toHaveBeenCalled()
    expect(authService.logout).toHaveBeenCalledWith(request, response)
    expect(authService.refresh).toHaveBeenCalledWith(request, response)
  })
})
