import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaLiteral } from '@swagger/util'

export function RemoveRecipeLikeDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove recipe like',
      description: 'Remove recipe like for current user',
    }),
    ApiOkResponse({
      description: 'Recipe like removed successfully',
      schema: successApiSchemaLiteral(null),
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
      description: 'Recipe not found',
      entityType: 'Recipe',
      identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
    }),
  )
}
