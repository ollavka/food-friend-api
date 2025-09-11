import { HttpStatus } from '@nestjs/common'
import { ApiExceptionResponseParams } from '@swagger/type'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

export function ApiResourceNotFoundExceptionResponse({
  description,
  details,
}: Omit<ApiExceptionResponseParams, 'type'>): MethodDecorator {
  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.NOT_FOUND,
    description: description ?? 'Resource not found',
    details,
    typeKeyOverride: 'not-found',
    messageOverride: 'Resource not found.',
  })
}
