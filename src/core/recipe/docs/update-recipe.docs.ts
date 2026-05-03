import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiAuthorizationExceptionResponse,
  ApiBadRequestExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiLanguage,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { RecipeApiModel } from '../api-model'
import { UpdateRecipeDto } from '../dto'

export function UpdateRecipeDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Update recipe',
      description: 'Update recipe fields and translation in selected language',
    }),
    ApiBody({ type: UpdateRecipeDto, required: true }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Recipe successfully updated',
      schema: successApiSchemaRef(RecipeApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiAuthorizationExceptionResponse({
      description: 'Current user cannot update this recipe',
      variants: [
        {
          typeKey: 'forbidden',
          summary: 'User has no access to update this recipe',
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
      {
        property: 'status',
        value: 'INVALID',
        constraints: { isIn: 'Field status must be one of the allowed values: DRAFT, PUBLISHED, ARCHIVED.' },
      },
    ]),
    ApiBadRequestExceptionResponse({
      description: 'Invalid recipe update payload',
      variants: [
        {
          typeKey: 'bad-request.recipe.translation-title-required',
          summary: 'Title is required when creating translation in new language',
          example: {
            reason: 'Recipe title is required to create translation for the selected language.',
          },
        },
        {
          typeKey: 'bad-request.recipe.ingredient-unit-mismatch',
          summary: 'Unit is not compatible with product type',
          example: {
            reason: 'Ingredient measurement unit is not compatible with product base type.',
            productId: 'LnT8BAUhhoJ2Y6MuB9AAZp',
            measurementUnitId: 'LnT8BAUhhoJ2Y6MuB9AAZp',
          },
        },
      ],
    }),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'Recipe or related entity not found',
      variants: [
        {
          summary: 'Recipe not found',
          entityType: 'Recipe',
          identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
        },
        {
          summary: 'Recipe difficulty not found',
          entityType: 'RecipeDifficulty',
          identity: { key: 'HARD' },
        },
        {
          summary: 'Ingredient product not found',
          entityType: 'Product',
          identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
        },
        {
          summary: 'Ingredient measurement unit not found',
          entityType: 'MeasurementUnit',
          identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
        },
      ],
    }),
  )
}
