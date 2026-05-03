import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { UserApiModel } from '../api-model'

export function GetUserByIdDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user by id',
      description: 'Returns user profile details by identifier.',
    }),
    ApiOkResponse({
      description: 'User retrieved successfully',
      schema: successApiSchemaRef(UserApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'id',
        value: 'invalid-id',
        constraints: { isId: 'Field id must be a valid identifier.' },
      },
    ]),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'User not found',
      entityType: 'User',
      identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
    }),
  )
}
