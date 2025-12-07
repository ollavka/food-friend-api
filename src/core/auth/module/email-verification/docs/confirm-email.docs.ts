import { HttpStatus, applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ConfirmOtpCodeDto } from '@common/dto'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiBadRequestExceptionResponse,
  ApiHttpExceptionResponse,
  ApiRateLimitExceptionResponse,
  ApiUserStatusPolicyExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'

export function ConfirmEmailDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirm email',
      description: 'Confirm email by OTP code',
    }),
    ApiBody({ type: ConfirmOtpCodeDto, required: true }),
    ApiOkResponse({
      description:
        'Returns a success message to the authorized user; otherwise, returns the access token and creates a session for the user',
      content: {
        'application/json': {
          examples: {
            accessTokenResponse: {
              summary: 'Access token with user',
              value: {
                status: 'success',
                data: {
                  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiO...',
                  user: {
                    id: '2Sd1axH6Lf8N5DaiZcDDYG',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@mail.com',
                    isVerified: true,
                    isAdmin: false,
                    isBlocked: false,
                  },
                },
              },
            },
            successMessageResponse: {
              summary: 'Success message',
              value: {
                status: 'success',
                data: {
                  message: 'The email has been successfully confirmed.',
                },
              },
            },
          },
        },
      },
    }),
    ApiBadRequestExceptionResponse({
      description: 'OTP ticket is unavailable or the code is invalid',
      variants: [
        {
          typeKey: 'bad-request.otp.status-mismatch',
          summary: 'OTP ticket is unavailable for this action',
          example: {
            reason: 'The OTP ticket is not available for this action.',
          },
        },
        {
          typeKey: 'bad-request.otp.code-unavailable',
          summary: 'OTP code is no longer valid',
          example: {
            reason: 'This OTP code is no longer valid.',
          },
        },
        {
          typeKey: 'bad-request.otp.invalid',
          summary: 'OTP code is invalid',
          example: {
            reason: 'Invalid OTP code.',
          },
        },
      ],
    }),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'User or OTP code not found',
      variants: [
        {
          summary: 'User not found',
          entityType: 'User',
          identity: { email: 'john.doe@mail.com' },
        },
        {
          summary: 'OTP code not found',
          entityType: 'OTP',
          identity: { id: '6wvHiPEGR5X3wTPtTkjEhS' },
        },
      ],
    }),
    ApiHttpExceptionResponse({
      statusCode: HttpStatus.GONE,
      description: 'OTP code is expired',
      typeKeyOverride: 'gone.otp-expired',
      messageOverride: 'Gone.',
      details: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        example: {
          reason: 'OTP code is expired.',
        },
      },
    }),
    ApiValidationExceptionResponse([
      {
        property: 'ticket',
        constraints: {
          isId: 'Value must be a valid ID.',
          value: 'invalid-ticket',
        },
      },
      {
        property: 'code',
        value: '123abcd',
        constraints: {
          isNumberString: 'Value must be a number string.',
        },
      },
    ]),
    ApiUserStatusPolicyExceptionResponse(),
    ApiRateLimitExceptionResponse('otp'),
  )
}
