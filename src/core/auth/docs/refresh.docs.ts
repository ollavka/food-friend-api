import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiAuthenticationExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiUserStatusPolicyExceptionResponse,
} from '@swagger/decorator'
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
    ApiBearerAccessTokenAuth(),
    ApiAuthenticationExceptionResponse({
      description: 'User not authenticated or refresh token missing, expired or invalid',
      variants: [
        {
          messageOverride: 'Authentication failed.',
          summary: 'User not authenticated',
          details: {
            type: 'object',
            properties: { reason: { type: 'string' } },
            required: ['reason'],
          },
          example: { reason: 'You are not authenticated.' },
        },
        {
          typeKey: 'refresh-token-not-found',
          messageOverride: 'Authentication failed.',
          summary: 'Refresh token missing',
          details: {
            type: 'object',
            properties: { reason: { type: 'string' } },
            required: ['reason'],
          },
          example: { reason: 'Refresh token does not exist.' },
        },
        {
          typeKey: 'refresh-token-expired',
          messageOverride: 'Authentication failed.',
          summary: 'Refresh token is expired',
          details: {
            type: 'object',
            properties: { reason: { type: 'string' } },
            required: ['reason'],
          },
          example: { reason: 'Refresh token is expired.' },
        },
        {
          typeKey: 'refresh-token-invalid',
          messageOverride: 'Authentication failed.',
          summary: 'Invalid refresh token',
          details: {
            type: 'object',
            properties: { reason: { type: 'string' } },
            required: ['reason'],
          },
          example: { reason: 'Invalid refresh token.' },
        },
      ],
    }),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'User not found by token',
      entityType: 'User',
      identity: { id: '6wvHiPEGR5X3wTPtTkjEhS' },
    }),
    ApiUserStatusPolicyExceptionResponse(),
  )
}
