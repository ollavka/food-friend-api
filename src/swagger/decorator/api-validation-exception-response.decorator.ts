import { HttpStatus } from '@nestjs/common'
import { ApiExceptionDetails } from '@swagger/type'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

export function ApiValidationExceptionResponse(detailsModel: ApiExceptionDetails): MethodDecorator {
  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
    details: detailsModel,
    typeKeyOverride: 'validation',
    messageOverride: 'Validation failed.',
  })
}
