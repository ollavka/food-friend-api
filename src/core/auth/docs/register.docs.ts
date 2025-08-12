import { HttpStatus, applyDecorators } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger'
import { ApiHttpExceptionResponse, ApiValidationExceptionResponse } from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { AccessTokenApiModel, AuthValidationDetailsApiModel } from '../api-model'
import { RegisterUserDto } from '../dto'

export function RegisterDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a new user',
      description: 'Creates a new account, sends a verification email and returns an access token (JWT)',
    }),
    ApiBody({ description: 'Registration payload', type: RegisterUserDto, required: true }),
    ApiCreatedResponse({
      description: 'User successfully registered',
      schema: successApiSchemaRef(AccessTokenApiModel),
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
    ApiValidationExceptionResponse(AuthValidationDetailsApiModel),
  )
}
