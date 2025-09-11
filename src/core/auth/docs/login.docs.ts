import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAuthenticationExceptionResponse,
  ApiUserStatusPolicyExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { AccessTokenApiModel, AuthValidationDetailsApiModel } from '../api-model'
import { LoginUserDto } from '../dto'

export function LoginDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Log in with credentials',
      description: 'Authenticates user by email and password and returns an access token (JWT)',
    }),
    ApiBody({ type: LoginUserDto, required: true }),
    ApiOkResponse({
      description: 'User successfully registered',
      schema: successApiSchemaRef(AccessTokenApiModel),
    }),
    ApiValidationExceptionResponse(AuthValidationDetailsApiModel),
    ApiAuthenticationExceptionResponse({
      type: 'credentials',
      description: 'Invalid credentials',
      details: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        example: {
          reason: 'Invalid credentials.',
        },
      },
    }),
    ApiUserStatusPolicyExceptionResponse(),
  )
}
