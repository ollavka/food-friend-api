import { HttpStatus } from '@nestjs/common'
import { Exception, ExceptionDetails } from '.'

export class AppBadRequestException extends Exception {
  public httpStatus: HttpStatus = HttpStatus.BAD_REQUEST

  public constructor(type: string, reason: string | null, details?: ExceptionDetails) {
    super('Bad request.', { type: `bad-request.${type}`, details: { ...details, reason } })
  }
}
