import { User, UserStatus } from '@prisma/client'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { Nullable } from '@common/type'

export class StatusPolicy {
  private static blocked(): never {
    throw new AccessControlAuthorizationException(
      'user-blocked',
      'Your account has been blocked. Please contact support.',
    )
  }

  private static accessDenied(): never {
    throw new AccessControlAuthorizationException('forbidden', 'Access denied. Please contact support.')
  }

  private static unverified(): never {
    throw new AccessControlAuthorizationException(
      'email-confirmation',
      'Email not confirmed. Please verify your email address in your profile settings.',
    )
  }

  public static async enforce(user: Nullable<User>, onlyActiveStatus?: boolean): Promise<boolean> {
    switch (user?.status) {
      case UserStatus.ACTIVE:
        return true

      case UserStatus.UNVERIFIED:
        return onlyActiveStatus ? this.unverified() : true

      case UserStatus.BLOCKED:
        return this.blocked()

      default:
        return this.accessDenied()
    }
  }
}
