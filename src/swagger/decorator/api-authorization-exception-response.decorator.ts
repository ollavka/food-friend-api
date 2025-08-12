import { HttpStatus } from '@nestjs/common'
import { ApiExceptionResponseParams } from '@swagger/type'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

export function ApiAuthorizationExceptionResponse({
  type,
  description,
  detailsModel,
}: ApiExceptionResponseParams): MethodDecorator {
  const exceptionType = ['access-control.authorization', type].filter(Boolean).join('.')

  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.FORBIDDEN,
    description: description ?? 'Authorization failed',
    details: detailsModel,
    typeKeyOverride: exceptionType,
    messageOverride: 'Authorization failed.',
  })
}
