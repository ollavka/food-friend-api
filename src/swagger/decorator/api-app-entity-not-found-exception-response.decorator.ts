import { HttpStatus } from '@nestjs/common'
import { ApiExceptionResponseParams } from '@swagger/type'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

export function ApiAppEntityNotFoundExceptionResponse({
  description,
  details,
}: Omit<ApiExceptionResponseParams, 'type'>): MethodDecorator {
  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.NOT_FOUND,
    description: description ?? 'Entity not found',
    details,
    typeKeyOverride: 'app.entity-not-found',
    messageOverride: 'Entity not found.',
  })
}
