import { HttpStatus } from '@nestjs/common'
import { ExceptionDetails } from '@common/exception'
import { def } from '@common/util'
import { AccessControlException } from './access-control.exception'

export class AccessControlAuthorizationException extends AccessControlException {
  public httpStatus: HttpStatus = HttpStatus.FORBIDDEN

  public constructor(type: string | null, reason: string | null, details?: ExceptionDetails) {
    const baseType = 'authorization'
    const exceptionType = def(type) ? `${baseType}.${type}` : baseType
    super(exceptionType, 'Authorization failed.', { ...details, reason })
  }
}
