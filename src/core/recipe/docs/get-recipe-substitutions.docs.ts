import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiBadRequestExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { RecipeSubstitutionsApiModel } from '../api-model'
import { RecipeSubstitutionsDto } from '../dto'

export function GetRecipeSubstitutionsDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve recipe ingredient substitutions',
      description: 'Return substitution candidates for selected recipe ingredient based on measurement base type.',
    }),
    ApiBody({ type: RecipeSubstitutionsDto, required: true }),
    ApiOkResponse({
      description: 'Recipe substitutions successfully retrieved',
      schema: successApiSchemaRef(RecipeSubstitutionsApiModel),
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
        property: 'ingredientProductId',
        value: 'invalid-id',
        constraints: { isId: 'Field ingredientProductId must be a valid identifier.' },
      },
      {
        property: 'limit',
        value: 0,
        constraints: { min: 'Field limit must not be less than 1.' },
      },
    ]),
    ApiBadRequestExceptionResponse({
      description: 'Substitutions request is invalid',
      variants: [
        {
          typeKey: 'bad-request.recipe.substitution-ingredient-not-found',
          summary: 'Ingredient is not part of the selected recipe',
          example: {
            reason: 'Ingredient product is not part of the selected recipe.',
          },
        },
      ],
    }),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'Recipe not found',
      entityType: 'Recipe',
      identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
    }),
  )
}
