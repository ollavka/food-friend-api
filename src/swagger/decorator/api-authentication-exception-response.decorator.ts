import { HttpStatus } from '@nestjs/common'
import { ApiExceptionResponseParams } from '@swagger/type'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

export type ApiAuthenticationExceptionResponseParams = ApiExceptionResponseParams

export function ApiAuthenticationExceptionResponse({
  type,
  description,
  details,
  variants = [],
}: ApiAuthenticationExceptionResponseParams): MethodDecorator {
  const exceptionTypePrefix = 'access-control.authentication'

  if (variants.length > 0) {
    return ApiHttpExceptionResponse({
      statusCode: HttpStatus.UNAUTHORIZED,
      description: description ?? 'Authentication failed',
      variants: variants.map(({ typeKey, details, ...restVariant }) => ({
        typeKey: [exceptionTypePrefix, typeKey].filter(Boolean).join('.'),
        details: details ?? null,
        ...restVariant,
      })),
    })
  }

  const exceptionType = [exceptionTypePrefix, type].filter(Boolean).join('.')

  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.UNAUTHORIZED,
    description: description ?? 'Authentication failed',
    details,
    typeKeyOverride: exceptionType,
    messageOverride: 'Authentication failed.',
  })
}
