import { HttpStatus } from '@nestjs/common'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

export function ApiRateLimitExceptionResponse(type: string): MethodDecorator {
  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit',
    messageOverride: 'Rate limit.',
    typeKeyOverride: `rate-limit.${type}`,
    details: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
        secondsLeft: { type: 'number' },
      },
      required: ['reason', 'secondsLeft'],
      example: {
        reason: 'You have exceeded the rate limit. Please try again in 10 seconds.',
        secondsLeft: 10,
      },
    },
  })
}
