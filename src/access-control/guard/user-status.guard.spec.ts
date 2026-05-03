import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Reflector } from '@nestjs/core'
import { StatusPolicy } from '@access-control/util'
import { UserStatusGuard } from './user-status.guard'

describe('UserStatusGuard', () => {
  const reflector: Pick<Reflector, 'get'> = {
    get: jest.fn(),
  }

  let guard: UserStatusGuard

  beforeEach(() => {
    jest.clearAllMocks()
    guard = new UserStatusGuard(reflector as Reflector)
  })

  it('should pass resolved policy result', async () => {
    ;(reflector.get as jest.Mock).mockReturnValueOnce(true)

    const enforceSpy = jest.spyOn(StatusPolicy, 'enforce').mockResolvedValue(true)

    const context = {
      getClass: () => ({ name: 'Controller' }),
      getHandler: () => ({ name: 'method' }),
      switchToHttp: () => ({ getRequest: () => ({ user: { id: 'u1' } }) }),
    }

    await expect(guard.canActivate(context as never)).resolves.toBe(true)
    expect(enforceSpy).toHaveBeenCalledWith({ id: 'u1' }, true)
  })

  it('should default onlyActiveStatus to false', async () => {
    ;(reflector.get as jest.Mock).mockReturnValue(undefined)

    const enforceSpy = jest.spyOn(StatusPolicy, 'enforce').mockResolvedValue(true)

    const context = {
      getClass: () => ({ name: 'Controller' }),
      getHandler: () => ({ name: 'method' }),
      switchToHttp: () => ({ getRequest: () => ({ user: { id: 'u1' } }) }),
    }

    await guard.canActivate(context as never)
    expect(enforceSpy).toHaveBeenCalledWith({ id: 'u1' }, false)
  })
})
