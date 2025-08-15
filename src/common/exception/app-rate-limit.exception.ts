import { HttpStatus } from '@nestjs/common'
import { Exception, ExceptionDetails } from '.'

export class AppRateLimitException extends Exception {
  public httpStatus: HttpStatus = HttpStatus.TOO_MANY_REQUESTS

  public constructor(type: string, reason: string | null, details?: ExceptionDetails) {
    super('Rate limit.', { type: `rate-limit.${type}`, details: { ...details, reason } })
  }
}
