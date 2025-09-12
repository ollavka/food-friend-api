import { HttpStatus, applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ConfirmOtpCodeDto } from '@common/dto'
import { OtpTicketApiModel } from '@core/auth/api-model'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiBadRequestExceptionResponse,
  ApiHttpExceptionResponse,
  ApiRateLimitExceptionResponse,
  ApiUserStatusPolicyExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'

export function ResetPasswordConfirmDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirm resetting password',
      description: 'Confirm resetting password by OTP code',
    }),
    ApiBody({ type: ConfirmOtpCodeDto, required: true }),
    ApiOkResponse({
      description:
        'Reset password OTP code has been successfully confirmed. You can use this ticket for completing reset password',
      schema: successApiSchemaRef(OtpTicketApiModel),
    }),
    ApiBadRequestExceptionResponse({
      description: 'OTP code is not available or invalid',
      variants: [
        {
          typeKey: 'otp-not-available',
          summary: 'OTP code is not available',
          example: {
            reason: 'OTP code is not available.',
          },
        },
        {
          typeKey: 'otp-not-invalid',
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
    ApiValidationExceptionResponse({
      example: [
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
      ],
    }),
    ApiUserStatusPolicyExceptionResponse(),
    ApiRateLimitExceptionResponse('otp'),
  )
}
