import { AuthGuard } from '@nestjs/passport'
import { AccessControlAuthenticationException } from '@access-control/exception'

export class JwtAuthGuard extends AuthGuard('jwt') {
  public handleRequest<User>(err: unknown, user: User): User {
    if (err || !user) {
      throw new AccessControlAuthenticationException(null, 'You are not authenticated.')
    }

    return user
  }
}
