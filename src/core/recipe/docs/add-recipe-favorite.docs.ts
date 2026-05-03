import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaLiteral } from '@swagger/util'

export function AddRecipeFavoriteDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Add recipe to favorites',
      description: 'Add recipe to current user favorites',
    }),
    ApiOkResponse({
      description: 'Recipe added to favorites successfully',
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
