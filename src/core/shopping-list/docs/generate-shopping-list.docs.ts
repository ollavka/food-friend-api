import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiLanguage,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { ShoppingListApiModel } from '../api-model'
import { GenerateShoppingListDto } from '../dto'

export function GenerateShoppingListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Generate shopping list',
      description: 'Generate shopping list from selected recipes for current user',
    }),
    ApiBody({ type: GenerateShoppingListDto, required: true }),
    ApiLanguage(),
    ApiCreatedResponse({
      description: 'Shopping list successfully generated',
      schema: successApiSchemaRef(ShoppingListApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'recipeIds',
        value: [],
        constraints: { arrayMinSize: 'Field recipeIds must contain at least 1 element(s).' },
      },
      {
        property: 'recipeIds.0',
        value: 'invalid-id',
        constraints: { isId: 'Field recipeIds must contain valid identifiers.' },
      },
    ]),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'Recipe not found or unavailable for current user',
      entityType: 'Recipe',
      identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
    }),
  )
}
