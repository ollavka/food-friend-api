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
