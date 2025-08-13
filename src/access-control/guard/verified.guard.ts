import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { User, UserStatus } from '@prisma/client'
import { Request } from 'express'
import { AccessControlAuthenticationException, AccessControlAuthorizationException } from '@access-control/exception'
import { IS_DEV } from '@common/util'

@Injectable()
export class VerifiedGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest() as Request
    const user = <User>req.user ?? null

    if (!user) {
      throw new AccessControlAuthenticationException(null, 'You are not authenticated.')
    }

    if (!IS_DEV && user.status === UserStatus.UNVERIFIED) {
      throw new AccessControlAuthorizationException('email-confirmation', 'Email not confirmed.')
    }

    return true
  }
}
