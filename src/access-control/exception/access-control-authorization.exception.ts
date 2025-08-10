import { HttpStatus } from '@nestjs/common'
import { ExceptionDetails } from '@common/exception'
import { AccessControlException } from './access-control.exception'

export class AccessControlAuthorizationException extends AccessControlException {
  public httpStatus: HttpStatus = HttpStatus.FORBIDDEN

  public constructor(type: string | null, reason: string | null, details?: ExceptionDetails) {
    super(`authorization.${type}`, 'Authorization failed.', { ...details, reason })
  }
}
