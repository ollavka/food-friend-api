import { Catch, UnauthorizedException } from '@nestjs/common'
import { AccessControlAuthenticationException } from '@access-control/exception'
import { Exception } from '@common/exception'
import { AppExceptionFilter } from '.'

@Catch(UnauthorizedException)
export class AuthenticationExceptionFilter extends AppExceptionFilter {
  protected errorToException(error: UnauthorizedException): Exception {
    return new AccessControlAuthenticationException(null, error.message, { stack: error.stack })
  }
}
