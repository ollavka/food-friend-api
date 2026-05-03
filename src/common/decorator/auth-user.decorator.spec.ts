import { describe, expect, it } from '@jest/globals'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { AuthUser } from './auth-user.decorator'

class AuthUserDecoratorTestController {
  public withUser(@AuthUser() _user: unknown): void {}

  public withUserField(@AuthUser('email') _email: unknown): void {}
}

describe('AuthUser decorator', () => {
  const getFactory = (methodName: keyof AuthUserDecoratorTestController): any => {
    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, AuthUserDecoratorTestController, methodName as string)
    const values = Object.values(metadata ?? {}) as Array<{ factory?: unknown }>
    return values[0]?.factory
  }

  const createContext = (user: Record<string, unknown> | null): any =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as any

  it('should return full user when key is not specified', () => {
    const factory = getFactory('withUser')
    const user = { id: '1', email: 'user@example.com' }

    expect(factory(undefined, createContext(user))).toEqual(user)
  })

  it('should return user field when key is provided', () => {
    const factory = getFactory('withUserField')
    const user = { id: '1', email: 'user@example.com' }

    expect(factory('email', createContext(user))).toBe('user@example.com')
  })
})
