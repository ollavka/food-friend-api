import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ANY_DOCS_JSON } from '@swagger/constant'
import { ApiAppEntityNotFoundExceptionResponse, ApiAuthenticationExceptionResponse } from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { AccessTokenApiModel } from '../api-model'

export function RefreshDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Refresh tokens',
      description: 'Refresh access and refresh tokens. Returns a new access token',
    }),
    ApiOkResponse({
      description: 'New access and refresh tokens',
      schema: successApiSchemaRef(AccessTokenApiModel),
    }),
    ApiAuthenticationExceptionResponse({
      type: 'refresh-token',
      description: 'Refresh token missing, expired, or invalid',
      detailsModel: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        example: {
          reason: 'Refresh token is expired.',
        },
      },
    }),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'User not found by token',
      detailsModel: {
        type: 'object',
        properties: {
          entityType: { type: 'string' },
          identity: { type: 'object', additionalProperties: ANY_DOCS_JSON },
        },
        required: ['entityType'],
        example: {
          entityType: 'User',
          identity: { id: '6wvHiPEGR5X3wTPtTkjEhS' },
        },
      },
    }),
  )
}
