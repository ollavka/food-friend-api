import { HttpStatus } from '@nestjs/common'
import { Exception, ExceptionDetails } from '.'

export class AppConflictException extends Exception {
  public httpStatus: HttpStatus = HttpStatus.CONFLICT

  public constructor(type: string, reason: string | null, details?: ExceptionDetails) {
    super('Conflict.', { type: `conflict.${type}`, details: { ...details, reason } })
  }
}
