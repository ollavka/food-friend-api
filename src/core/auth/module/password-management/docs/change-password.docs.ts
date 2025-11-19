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
import { ChangePasswordDto } from '../dto'

export function ChangePasswordDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Change password for user',
      description:
        'Change the password for the current user if they previously registered and logged in using only a password and email address, or have already set a password for this type of login',
    }),
    ApiBody({ type: ChangePasswordDto, required: true }),
    ApiOkResponse({
      description: 'Message about successful password change',
      example: {
        status: 'success',
        data: {
          message: 'The password has been successfully changed.',
        },
      },
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiUserStatusPolicyExceptionResponse(true),
    ApiHttpExceptionResponse({
      statusCode: HttpStatus.CONFLICT,
      description: 'No password has been set for this account',
      typeKeyOverride: 'conflict.password.not-set',
      details: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        example: {
          reason: 'No password has been set for this account.',
        },
      },
    }),
    ApiValidationExceptionResponse([
      {
        property: 'currentPassword',
        value: 'Invalid-password',
        constraints: { containsDigits: 'Value must contains at least one digit.' },
      },
      {
        property: 'newPassword',
        value: 'Invalid-password',
        constraints: { containsDigits: 'Value must contains at least one digit.' },
      },
    ]),
    ApiBadRequestExceptionResponse({
      description: 'The current password is incorrect or matches the new one',
      variants: [
        {
          typeKey: 'bad-request.password.invalid-current',
          summary: 'The current password is incorrect',
          example: {
            reason: 'The current password is incorrect.',
          },
        },
        {
          typeKey: 'bad-request.password.same-as-current',
          summary: 'The new password cannot be the same as the current password',
          example: {
            reason: 'The new password cannot be the same as the current password.',
          },
        },
      ],
    }),
  )
}
