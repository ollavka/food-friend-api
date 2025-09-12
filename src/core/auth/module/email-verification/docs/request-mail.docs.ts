import { HttpStatus, applyDecorators } from '@nestjs/common'
import { ApiAcceptedResponse, ApiBody, ApiOperation } from '@nestjs/swagger'
import { OtpTicketApiModel } from '@core/auth/api-model'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiHttpExceptionResponse,
  ApiRateLimitExceptionResponse,
  ApiUserStatusPolicyExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { SendVerificationMailDto } from '../dto'

export function RequestMailDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Request email verification mail',
      description: 'Request mail with OTP code for confirmation email',
    }),
    ApiBody({ type: SendVerificationMailDto, required: true }),
    ApiAcceptedResponse({
      description: 'Confirmation email mail has been successfully sent',
      schema: successApiSchemaRef(OtpTicketApiModel),
    }),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'User not found',
      entityType: 'User',
      identity: { id: '6wvHiPEGR5X3wTPtTkjEhS' },
    }),
    ApiUserStatusPolicyExceptionResponse(),
    ApiHttpExceptionResponse({
      statusCode: HttpStatus.BAD_REQUEST,
      description: 'User have already confirmed email address.',
      details: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        example: {
          reason: 'You have already confirmed your email address.',
        },
      },
    }),
    ApiRateLimitExceptionResponse('mail'),
    ApiHttpExceptionResponse({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      typeKeyOverride: 'internal',
      description: 'The confirmation email mail could not be sent',
      details: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        example: {
          reason: 'The confirmation email mail could not be sent.',
        },
      },
    }),
  )
}
