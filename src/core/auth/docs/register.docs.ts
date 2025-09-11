import { HttpStatus, applyDecorators } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger'
import { ApiHttpExceptionResponse, ApiValidationExceptionResponse } from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { AuthValidationDetailsApiModel, OtpTicketApiModel } from '../api-model'
import { RegisterUserDto } from '../dto'

export function RegisterDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a new user',
      description:
        'Creates a new account, generates an OTP code for email verification, sends welcome and verification emails, and returns a ticket for completing email verification',
    }),
    ApiBody({ description: 'Registration payload', type: RegisterUserDto, required: true }),
    ApiCreatedResponse({
      description: 'User successfully registered',
      schema: successApiSchemaRef(OtpTicketApiModel),
    }),
    ApiHttpExceptionResponse({
      statusCode: HttpStatus.CONFLICT,
      description: 'User email is already taken',
      details: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        example: {
          reason: 'This email address is already taken.',
        },
      },
    }),
    ApiHttpExceptionResponse({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      typeKeyOverride: 'internal',
      description: 'Some mail could not be sent',
      details: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        example: {
          reason: 'The welcome mail could not be sent.',
        },
      },
    }),
    ApiValidationExceptionResponse(AuthValidationDetailsApiModel),
  )
}
