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

export function RemoveProductDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove product',
      description: 'Remove product by id (owner or admin only)',
    }),
    ApiOkResponse({
      description: 'Product successfully removed',
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
    ApiAuthorizationExceptionResponse({
      description: 'Current user cannot remove this product',
      variants: [
        {
          typeKey: 'forbidden',
          summary: 'User has no access to remove this product',
          example: {
            reason: 'Access denied. Please contact support.',
          },
        },
      ],
    }),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'Product not found',
      entityType: 'Product',
      identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
    }),
  )
}
