import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { AccessControlAuthenticationException } from '@access-control/exception'

export class JwtAuthGuard extends AuthGuard('jwt') {
  public handleRequest<TUser = User>(err: unknown, user?: User | null): TUser {
    if (err || !user) {
      throw new AccessControlAuthenticationException(null, 'You are not authorized.')
    }

    return <TUser>user
  }
}
