import { HttpStatus, applyDecorators } from '@nestjs/common'
import { ApiAcceptedResponse, ApiBody, ApiOperation } from '@nestjs/swagger'
import { OtpTicketApiModel } from '@core/auth/api-model'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiHttpExceptionResponse,
  ApiRateLimitExceptionResponse,
  ApiUserStatusPolicyExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { ResetPasswordDto } from '../dto'

export function ResetPasswordRequestDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Reset password request',
      description: 'Sends a letter with an OTP code to reset the password',
    }),
    ApiBody({ type: ResetPasswordDto, required: true }),
    ApiAcceptedResponse({
      description: 'Reset password mail has been successfully sent',
      schema: successApiSchemaRef(OtpTicketApiModel),
    }),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'User not found',
      entityType: 'User',
      identity: { id: '6wvHiPEGR5X3wTPtTkjEhS' },
    }),
    ApiValidationExceptionResponse([
      {
        property: 'email',
        value: 'invalid-mail@mailcom',
        constraints: { isEmail: 'Value must be an email.' },
      },
    ]),
    ApiUserStatusPolicyExceptionResponse(),
    ApiRateLimitExceptionResponse('mail'),
    ApiHttpExceptionResponse({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      typeKeyOverride: 'internal',
      description: 'The reset password mail could not be sent',
      details: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        example: {
          reason: 'The reset password mail could not be sent.',
        },
      },
    }),
  )
}
