import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAuthenticationExceptionResponse,
  ApiUserStatusPolicyExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { AccessTokenApiModel } from '../api-model'
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
    ApiValidationExceptionResponse({
      example: [
        {
          property: 'email',
          value: 'invalid-mail@mailcom',
          constraints: { isEmail: 'Value must be an email.' },
        },
        {
          property: 'password',
          value: 'Invalid-password',
          constraints: { containsDigits: 'Value must contains at least one digit.' },
        },
      ],
    }),
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
