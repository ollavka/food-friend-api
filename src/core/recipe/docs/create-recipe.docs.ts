import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiBadRequestExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiLanguage,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { RecipeApiModel } from '../api-model'
import { CreateRecipeDto } from '../dto'

export function CreateRecipeDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Create recipe',
      description: 'Create a recipe in selected language with steps, ingredients and optional nutrition data',
    }),
    ApiBody({ type: CreateRecipeDto, required: true }),
    ApiLanguage(),
    ApiCreatedResponse({
      description: 'Recipe successfully created',
      schema: successApiSchemaRef(RecipeApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'title',
        value: '',
        constraints: { isNotEmpty: 'Field title should not be empty.' },
      },
      {
        property: 'steps',
        value: [],
        constraints: { arrayMinSize: 'Field steps must contain at least 1 element(s).' },
      },
      {
        property: 'ingredients',
        value: [],
        constraints: { arrayMinSize: 'Field ingredients must contain at least 1 element(s).' },
      },
      {
        property: 'ingredients.0.productId',
        value: 'invalid-id',
        constraints: { isId: 'Field productId must be a valid identifier.' },
      },
      {
        property: 'status',
        value: 'ARCHIVED',
        constraints: { isIn: 'Field status must be one of the allowed values: DRAFT, PUBLISHED.' },
      },
    ]),
    ApiBadRequestExceptionResponse({
      description: 'Ingredient measurement unit is incompatible with product base type',
      variants: [
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
      description: 'Related entity not found',
      variants: [
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
