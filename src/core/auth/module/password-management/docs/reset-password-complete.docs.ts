import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiBadRequestExceptionResponse,
  ApiUserStatusPolicyExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { ResetPasswordCompleteDto } from '../dto'

export function ResetPasswordCompleteDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Complete resetting password',
      description: 'Complete resetting password by OTP code',
    }),
    ApiBody({ type: ResetPasswordCompleteDto, required: true }),
    ApiOkResponse({
      description: 'Message about successful password reset',
      example: {
        summary: 'Success message',
        value: {
          status: 'success',
          data: {
            message: 'The password has been successfully reset.',
          },
        },
      },
    }),
    ApiBadRequestExceptionResponse({
      description: 'OTP code is not available or password are the same',
      variants: [
        {
          typeKey: 'otp-not-available',
          summary: 'OTP code is not available',
          example: {
            reason: 'OTP code is not available.',
          },
        },
        {
          typeKey: 'same-password',
          summary: 'The new password cannot be the same as the current password',
          example: {
            reason: 'The new password cannot be the same as the current password.',
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
          identity: { otpTicket: '6wvHiPEGR5X3wTPtTkjEhS' },
        },
        {
          summary: 'OTP code not found',
          entityType: 'OTP',
          identity: { id: '6wvHiPEGR5X3wTPtTkjEhS' },
        },
      ],
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
        property: 'newPassword',
        value: 'Invalid-password',
        constraints: { containsDigits: 'Value must contains at least one digit.' },
      },
    ]),
    ApiUserStatusPolicyExceptionResponse(),
  )
}
