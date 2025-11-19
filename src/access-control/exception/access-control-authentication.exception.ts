import { HttpStatus } from '@nestjs/common'
import { ExceptionDetails } from '@common/exception'
import { def } from '@common/util'
import { AccessControlException } from './access-control.exception'

export class AccessControlAuthenticationException extends AccessControlException {
  public httpStatus: HttpStatus = HttpStatus.UNAUTHORIZED

  public constructor(type: string | null, reason: string | null, details?: ExceptionDetails) {
    const baseType = 'authentication'
    const exceptionType = def(type) ? `${baseType}.${type}` : baseType
    super(exceptionType, 'Authentication failed.', { ...details, reason })
  }
}
