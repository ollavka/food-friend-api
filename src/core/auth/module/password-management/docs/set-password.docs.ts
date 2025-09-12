import { HttpStatus, applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiHttpExceptionResponse,
  ApiUserStatusPolicyExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { SetPasswordDto } from '../dto'

export function SetPasswordDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Set password for user',
      description:
        'Set a password for the current user if they previously registered and authorized only through providers, do not use email and password login, and do not yet have an active password',
    }),
    ApiBody({ type: SetPasswordDto, required: true }),
    ApiOkResponse({
      description: 'Message about successful password set',
      example: {
        summary: 'Success message',
        value: {
          status: 'success',
          data: {
            message: 'The password has been successfully set.',
          },
        },
      },
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiUserStatusPolicyExceptionResponse(true),
    ApiValidationExceptionResponse({
      example: [
        {
          property: 'password',
          value: 'Invalid-password',
          constraints: { containsDigits: 'Value must contains at least one digit.' },
        },
      ],
    }),
    ApiHttpExceptionResponse({
      statusCode: HttpStatus.CONFLICT,
      description: 'The password has already been set',
      details: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        example: {
          reason: 'The password has already been set.',
        },
      },
    }),
  )
}
