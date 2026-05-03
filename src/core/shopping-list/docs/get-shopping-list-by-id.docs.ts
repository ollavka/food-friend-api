import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiAuthorizationExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiLanguage,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { ShoppingListApiModel } from '../api-model'

export function GetShoppingListByIdDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve shopping list by id',
      description: 'Retrieve shopping list details with localized product and measurement unit labels',
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Shopping list successfully retrieved',
      schema: successApiSchemaRef(ShoppingListApiModel),
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
      description: 'Current user cannot access this shopping list',
      variants: [
        {
          typeKey: 'forbidden',
          summary: 'User has no access to this shopping list',
          example: {
            reason: 'Access denied. Please contact support.',
          },
        },
      ],
    }),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'Shopping list not found',
      entityType: 'ShoppingList',
      identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
    }),
  )
}
