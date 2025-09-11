import { HttpStatus } from '@nestjs/common'
import { ApiExceptionResponseParams, ApiHttpExceptionResponseVariant } from '@swagger/type'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

export type ApiAuthorizationExceptionResponseParams = ApiExceptionResponseParams & {
  variants?: Array<ApiHttpExceptionResponseVariant>
}

export function ApiAuthorizationExceptionResponse({
  type,
  description,
  details,
  variants = [],
}: ApiAuthorizationExceptionResponseParams): MethodDecorator {
  const exceptionTypePrefix = 'access-control.authorization'

  if (variants.length > 0) {
    return ApiHttpExceptionResponse({
      statusCode: HttpStatus.FORBIDDEN,
      description: description ?? 'Authorization failed',
      variants: variants.map(({ typeKey, details, ...restVariant }) => ({
        typeKey: [exceptionTypePrefix, typeKey].filter(Boolean).join('.'),
        details: details ?? null,
        ...restVariant,
      })),
    })
  }

  const exceptionType = [exceptionTypePrefix, type].filter(Boolean).join('.')

  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.FORBIDDEN,
    description: description ?? 'Authorization failed',
    details: details,
    typeKeyOverride: exceptionType,
    messageOverride: 'Authorization failed.',
  })
}
