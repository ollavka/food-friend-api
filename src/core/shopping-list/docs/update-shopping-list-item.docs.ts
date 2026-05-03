import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ShoppingListItemStatus } from '@prisma/client'
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
import { UpdateShoppingListItemDto } from '../dto'

export function UpdateShoppingListItemDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Update shopping list item',
      description: 'Update shopping list item status or manual fields',
    }),
    ApiBody({ type: UpdateShoppingListItemDto, required: true }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Shopping list item successfully updated',
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
      {
        property: 'itemId',
        value: 'invalid-id',
        constraints: { isId: 'Field itemId must be a valid identifier.' },
      },
      {
        property: 'status',
        value: 'INVALID_STATUS',
        constraints: {
          isEnum: `Field status must be one of the allowed values: ${Object.values(ShoppingListItemStatus).join(', ')}.`,
        },
      },
    ]),
    ApiAuthorizationExceptionResponse({
      description: 'Current user cannot update this shopping list',
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
      description: 'Shopping list or item not found',
      variants: [
        {
          summary: 'Shopping list not found',
          entityType: 'ShoppingList',
          identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
        },
        {
          summary: 'Shopping list item not found',
          entityType: 'ShoppingListItem',
          identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
        },
      ],
    }),
  )
}
