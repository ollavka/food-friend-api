import { Catch, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { Exception } from '@common/exception'
import { AppExceptionFilter } from '.'

@Catch(ForbiddenException)
export class AuthorizationExceptionFilter extends AppExceptionFilter {
  protected errorToException(error: UnauthorizedException): Exception {
    return new AccessControlAuthorizationException(null, error.message, { stack: error.stack })
  }
}
