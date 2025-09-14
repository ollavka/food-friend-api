import { HttpStatus, applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiBadRequestExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiHttpExceptionResponse,
  ApiUserStatusPolicyExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { GoogleAuthDto } from '../dto'

export function LinkGoogleAccountDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Link Google account to existed user',
      description: 'Link Google account using a Google ID token (JWT) to user',
    }),
    ApiBody({ type: GoogleAuthDto, required: true }),
    ApiOkResponse({
      description: 'Message about successful link Google account',
      example: {
        status: 'success',
        data: {
          message: 'Google account has been successfully linked to your account.',
        },
      },
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiUserStatusPolicyExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'idToken',
        value: 'invalid-jwt',
        constraints: { isJWT: 'Value must be a jwt string.' },
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
    ApiHttpExceptionResponse({
      statusCode: HttpStatus.CONFLICT,
      description: 'This Google account is linked to another user',
      variants: [
        {
          summary: 'This Google account is linked to another user',
          details: {
            type: 'object',
            properties: {
              reason: { type: 'string' },
            },
            required: ['reason'],
          },
          example: {
            reason: 'This Google account is linked to another user.',
          },
        },
        {
          summary: 'You already has a Google account linked',
          details: {
            type: 'object',
            properties: {
              reason: { type: 'string' },
            },
            required: ['reason'],
          },
          example: {
            reason: 'You already has a Google account linked.',
          },
        },
      ],
    }),
  )
}
