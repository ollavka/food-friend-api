import { HttpStatus } from '@nestjs/common'
import { Exception, ExceptionDetails } from '.'

export class AppException extends Exception {
  public httpStatus: HttpStatus = HttpStatus.BAD_REQUEST

  public constructor(type: string, message: string, details?: ExceptionDetails) {
    super(message, { type: `app.${type}`, details })
  }
}
