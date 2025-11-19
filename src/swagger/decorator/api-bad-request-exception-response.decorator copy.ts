import { HttpStatus } from '@nestjs/common'
import { ApiExceptionResponseParams } from '@swagger/type'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

export type ApiBadRequestExceptionResponseParams = ApiExceptionResponseParams

export function ApiBadRequestExceptionResponse({
  type,
  description,
  details,
  variants = [],
}: ApiBadRequestExceptionResponseParams): MethodDecorator {
  if (variants.length > 0) {
    return ApiHttpExceptionResponse({
      statusCode: HttpStatus.BAD_REQUEST,
      description: description ?? 'Bad request',
      variants: variants.map(({ typeKey, details, ...restVariant }) => ({
        typeKey: typeKey ?? type ?? 'bad-request',
        details: details ?? null,
        ...restVariant,
      })),
    })
  }

  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.BAD_REQUEST,
    description: description ?? 'Bad request',
    details,
    typeKeyOverride: type ?? 'bad-request',
    messageOverride: 'Bad request.',
  })
}
