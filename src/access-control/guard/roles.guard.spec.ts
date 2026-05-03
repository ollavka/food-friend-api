import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { RolesGuard } from './roles.guard'

describe('RolesGuard', () => {
  const reflector: Pick<Reflector, 'getAllAndOverride'> = {
    getAllAndOverride: jest.fn(),
  }

  let guard: RolesGuard

  beforeEach(() => {
    jest.clearAllMocks()
    guard = new RolesGuard(reflector as Reflector)
  })

  it('should allow when no required roles are configured', () => {
    ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined)

    const context = {
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({ getRequest: () => ({ user: { role: UserRole.REGULAR } }) }),
    }

    expect(guard.canActivate(context as never)).toBe(true)
  })

  it('should allow when user has required role', () => {
    ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue([UserRole.ADMIN])

    const context = {
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({ getRequest: () => ({ user: { role: UserRole.ADMIN } }) }),
    }

    expect(guard.canActivate(context as never)).toBe(true)
  })

  it('should throw when user does not have required role', () => {
    ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue([UserRole.ADMIN])

    const context = {
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({ getRequest: () => ({ user: { role: UserRole.REGULAR } }) }),
    }

    expect(() => guard.canActivate(context as never)).toThrow(AccessControlAuthorizationException)
  })
})
