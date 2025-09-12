import { HttpStatus, Type } from '@nestjs/common'
import { ApiExceptionDetails } from '@swagger/type'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

export function ApiValidationExceptionResponse(detailsOrExample?: ApiExceptionDetails | unknown): MethodDecorator {
  const isModel = typeof detailsOrExample === 'function'
  const isExample = !isModel && detailsOrExample !== undefined

  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation failed',
    details: isModel ? (detailsOrExample as Type<unknown>) : undefined,
    typeKeyOverride: 'validation',
    messageOverride: 'Validation failed.',
    example: isExample ? { entries: detailsOrExample } : undefined,
  })
}
