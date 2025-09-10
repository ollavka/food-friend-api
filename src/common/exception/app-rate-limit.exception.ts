import { HttpStatus } from '@nestjs/common'
import { Exception, ExceptionDetails } from '.'

export class AppRateLimitException extends Exception {
  public httpStatus: HttpStatus = HttpStatus.TOO_MANY_REQUESTS

  public constructor(type: string, details: ExceptionDetails & { secondsLeft: number }) {
    const reason = `You have exceeded the rate limit. Please try again in ${details.secondsLeft} seconds.`
    super('Rate limit.', { type: `rate-limit.${type}`, details: { ...details, reason } })
  }
}
