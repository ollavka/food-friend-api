import { describe, expect, it } from '@jest/globals'
import { UserStatus } from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { StatusPolicy } from './status-policy.util'

describe('StatusPolicy', () => {
  it('should allow active users', async () => {
    await expect(StatusPolicy.enforce({ status: UserStatus.ACTIVE } as never, true)).resolves.toBe(true)
  })

  it('should allow unverified users when onlyActiveStatus is false', async () => {
    await expect(StatusPolicy.enforce({ status: UserStatus.UNVERIFIED } as never, false)).resolves.toBe(true)
  })

  it('should reject unverified users when onlyActiveStatus is true', async () => {
    await expect(StatusPolicy.enforce({ status: UserStatus.UNVERIFIED } as never, true)).rejects.toBeInstanceOf(
      AccessControlAuthorizationException,
    )
  })

  it('should reject blocked users', async () => {
    await expect(StatusPolicy.enforce({ status: UserStatus.BLOCKED } as never, false)).rejects.toBeInstanceOf(
      AccessControlAuthorizationException,
    )
  })

  it('should reject missing user', async () => {
    await expect(StatusPolicy.enforce(null, false)).rejects.toBeInstanceOf(AccessControlAuthorizationException)
  })
})
