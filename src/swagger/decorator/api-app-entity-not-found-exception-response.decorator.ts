import { HttpStatus } from '@nestjs/common'
import { ANY_DOCS_JSON } from '@swagger/constant'
import { ApiExceptionResponseParams } from '@swagger/type'
import { ApiHttpExceptionResponse } from './api-http-exception-response.decorator'

type ApiAppEntityNotFoundExceptionResponseParams = Pick<ApiExceptionResponseParams, 'description'> & {
  entityType?: string
  identity?: Record<string, any>
  variants?: Array<{
    summary: string
    entityType: string
    identity: Record<string, any>
  }>
}

export function ApiAppEntityNotFoundExceptionResponse({
  description,
  entityType,
  identity,
  variants = [],
}: ApiAppEntityNotFoundExceptionResponseParams): MethodDecorator {
  if (variants.length > 0) {
    return ApiHttpExceptionResponse({
      statusCode: HttpStatus.NOT_FOUND,
      description: description ?? 'Entity not found',
      variants: variants.map(({ entityType, summary, identity }) => ({
        typeKey: 'app.entity-not-found',
        messageOverride: 'Entity not found.',
        summary,
        example: {
          entityType,
          identity,
        },
      })),
    })
  }

  return ApiHttpExceptionResponse({
    statusCode: HttpStatus.NOT_FOUND,
    description: description ?? 'Entity not found',
    details: {
      type: 'object',
      properties: {
        entityType: { type: 'string' },
        identity: { type: 'object', additionalProperties: ANY_DOCS_JSON },
      },
      required: ['entityType'],
      example: {
        entityType,
        identity,
      },
    },
    typeKeyOverride: 'app.entity-not-found',
    messageOverride: 'Entity not found.',
  })
}
