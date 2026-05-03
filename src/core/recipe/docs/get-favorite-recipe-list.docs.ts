import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { RecipeDifficultyKey, RecipeStatus } from '@prisma/client'
import { SortOrder } from '@common/enum'
import {
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiLanguage,
  ApiResourceQuery,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { PaginatedRecipesApiModel } from '../api-model'
import { RECIPE_AVAILABLE_SORT_FIELDS } from '../constant'
import { RecipeFilterQueryDto } from '../dto'
import { RecipeSortField } from '../type'

export function GetFavoriteRecipeListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve current user favorite recipes',
      description: 'Retrieve paginated list of published recipes favorited by current user',
    }),
    ApiResourceQuery<RecipeFilterQueryDto, RecipeSortField>({
      filter: {
        fields: {
          search: {
            description: 'Case-insensitive search by recipe title, description or slug',
            example: 'mushroom pasta',
          },
          difficulty: {
            description: 'Recipe difficulty level key',
            enum: RecipeDifficultyKey,
            example: RecipeDifficultyKey.EASY,
          },
          status: {
            description: 'Recipe status for this endpoint. Only published recipes are available in public listing.',
            enum: [RecipeStatus.PUBLISHED],
            example: RecipeStatus.PUBLISHED,
          },
        },
      },
      sort: {
        availableFields: RECIPE_AVAILABLE_SORT_FIELDS,
      },
      pagination: {
        enabled: true,
      },
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Favorite recipe list successfully retrieved',
      schema: successApiSchemaRef(PaginatedRecipesApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'filter.difficulty',
        value: 'INVALID_DIFFICULTY',
        constraints: {
          isEnum: `Field filter.difficulty must be one of the allowed values: ${Object.values(RecipeDifficultyKey).join(', ')}.`,
        },
      },
      {
        property: 'filter.status',
        value: 'DRAFT',
        constraints: {
          isIn: `Field filter.status must be one of the allowed values: ${RecipeStatus.PUBLISHED}.`,
        },
      },
      {
        property: 'sort.field',
        value: 'unknown',
        constraints: {
          isIn: `Field sort.field must be one of the allowed values: ${RECIPE_AVAILABLE_SORT_FIELDS.join(', ')}.`,
        },
      },
      {
        property: 'sort.order',
        value: 'invalid',
        constraints: {
          isEnum: `Field sort.order must be one of the allowed values: ${Object.values(SortOrder).join(', ')}.`,
        },
      },
      {
        property: 'pagination.page',
        value: 0,
        constraints: { min: 'Field pagination.page must not be less than 1.' },
      },
      {
        property: 'pagination.limit',
        value: 101,
        constraints: { min: 'Field pagination.limit must be less or equals to 100.' },
      },
      {
        property: 'pagination.limit',
        value: 0,
        constraints: { min: 'Field pagination.limit must not be less than 1.' },
      },
    ]),
  )
}
