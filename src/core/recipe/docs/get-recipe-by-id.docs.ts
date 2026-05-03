import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ApiAppEntityNotFoundExceptionResponse, ApiLanguage, ApiValidationExceptionResponse } from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { RecipeApiModel } from '../api-model'

export function GetRecipeByIdDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve recipe by id',
      description: 'Retrieve single recipe details with localized content by id',
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Recipe successfully retrieved',
      schema: successApiSchemaRef(RecipeApiModel),
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
