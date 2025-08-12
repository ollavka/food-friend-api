import { HttpStatus } from '@nestjs/common'
import { ApiExceptionResponseParams } from '@swagger/type'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

export function ApiAuthenticationExceptionResponse({
  type,
  description,
  detailsModel,
}: ApiExceptionResponseParams): MethodDecorator {
  const exceptionType = ['access-control.authentication', type].filter(Boolean).join('.')

  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.UNAUTHORIZED,
    description: description ?? 'Authentication failed',
    details: detailsModel,
    typeKeyOverride: exceptionType,
    messageOverride: 'Authentication failed.',
  })
}
