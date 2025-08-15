import { HttpStatus } from '@nestjs/common'
import { Exception, ExceptionDetails } from '.'

export class AppException extends Exception {
  public constructor(type: string, message: string, httpStatus?: HttpStatus | null, details?: ExceptionDetails) {
    super(message, { type: `app.${type}`, httpStatus: httpStatus ?? HttpStatus.BAD_REQUEST, details })
  }
}
