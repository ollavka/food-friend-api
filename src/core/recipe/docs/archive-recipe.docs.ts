import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiAuthorizationExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaLiteral } from '@swagger/util'

export function ArchiveRecipeDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Archive recipe',
      description: 'Archive recipe and hide it from public listing',
    }),
    ApiOkResponse({
      description: 'Recipe successfully archived',
      schema: successApiSchemaLiteral(null),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiAuthorizationExceptionResponse({
      description: 'Current user cannot archive this recipe',
      variants: [
        {
          typeKey: 'forbidden',
          summary: 'User has no access to archive this recipe',
          example: {
            reason: 'Access denied. Please contact support.',
          },
        },
      ],
    }),
    ApiValidationExceptionResponse([
      {
        property: 'id',
        value: 'invalid-id',
        constraints: { isId: 'Field id must be a valid identifier.' },
      },
    ]),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'Recipe not found',
      entityType: 'Recipe',
      identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
    }),
  )
}
