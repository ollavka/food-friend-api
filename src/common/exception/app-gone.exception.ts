import { HttpStatus } from '@nestjs/common'
import { Exception, ExceptionDetails } from '.'

export class AppGoneException extends Exception {
  public httpStatus: HttpStatus = HttpStatus.GONE

  public constructor(type: string, reason: string | null, details?: ExceptionDetails) {
    super('Gone.', { type: `gone.${type}`, details: { ...details, reason } })
  }
}
