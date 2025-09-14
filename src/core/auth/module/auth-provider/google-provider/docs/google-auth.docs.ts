import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { AccessTokenApiModel } from '@core/auth/api-model'
import { ApiBadRequestExceptionResponse, ApiValidationExceptionResponse } from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { GoogleAuthDto } from '../dto'

export function GoogleAuthDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Authentication or registration via Google provider',
      description: 'Authentication or registration via Google provider using a Google ID token (JWT)',
    }),
    ApiBody({ type: GoogleAuthDto, required: true }),
    ApiOkResponse({
      description: 'User successfully authenticated',
      schema: successApiSchemaRef(AccessTokenApiModel),
    }),
    ApiValidationExceptionResponse([
      {
        property: 'idToken',
        value: 'invalid-jwt',
        constraints: { isJWT: 'Value must be a JWT.' },
      },
    ]),
    ApiBadRequestExceptionResponse({
      description: 'Errors related to Google ID token',
      variants: [
        {
          typeKey: 'invalid-token-payload',
          summary: 'Invalid Google token payload',
          example: {
            reason: 'Invalid Google token payload.',
          },
        },
        {
          typeKey: 'invalid-or-expired-token',
          summary: 'Invalid or expired Google ID token',
          example: {
            reason: 'Invalid or expired Google ID token.',
          },
        },
        {
          typeKey: 'google-email-required',
          summary: 'Google email is required',
          example: {
            reason: 'Google email is required.',
          },
        },
        {
          typeKey: 'google-email-verified',
          summary: 'Google email must be verified',
          example: {
            reason: 'Google email must be verified to sign in.',
          },
        },
      ],
    }),
  )
}
