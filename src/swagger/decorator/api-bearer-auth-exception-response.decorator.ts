import { HttpStatus } from '@nestjs/common'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

export function ApiBearerAuthExceptionResponse(): MethodDecorator {
  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
    details: {
      type: 'object',
      properties: { reason: { type: 'string' } },
      required: ['reason'],
      example: { reason: 'You are not authenticated.' },
    },
    typeKeyOverride: 'access-control.authentication',
    messageOverride: 'Authentication failed.',
  })
}
