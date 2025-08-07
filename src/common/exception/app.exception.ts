import { HttpStatus } from '@nestjs/common'
import { Exception } from '.'

export class AppException extends Exception {
  public httpStatus: HttpStatus = HttpStatus.BAD_REQUEST

  public constructor(type: string, message: string, details?: Record<string, unknown>) {
    super(message, { type: `app.${type}`, details })
  }
}
