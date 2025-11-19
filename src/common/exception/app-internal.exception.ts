import { HttpStatus } from '@nestjs/common'
import { Exception, ExceptionDetails } from '.'

export class AppInternalException extends Exception {
  public httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR

  public constructor(type: string, reason: string | null, details?: ExceptionDetails) {
    super('Internal server error.', {
      type: `internal.${type}`,
      details: { ...details, reason },
    })
  }
}
