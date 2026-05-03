import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { RecipeDifficultyKey } from '@prisma/client'
import { ApiLanguage, ApiResourceQuery, ApiValidationExceptionResponse } from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { PaginatedSearchRecipesApiModel } from '../api-model'
import { SearchRecipeFilterQueryDto } from '../dto'

export function SearchRecipesDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Search recipes',
      description: 'Search published recipes in Meilisearch index with localized output and pagination.',
    }),
    ApiResourceQuery<SearchRecipeFilterQueryDto>({
      filter: {
        fields: {
          search: {
            description: 'Case-insensitive full-text query by recipe title, description or slug',
            example: 'mushroom soup',
          },
          difficulty: {
            description: 'Recipe difficulty key filter',
            enum: RecipeDifficultyKey,
            example: RecipeDifficultyKey.EASY,
          },
          maxCookingTimeMinutes: {
            description: 'Maximum cooking time in minutes',
            example: 30,
          },
        },
      },
      pagination: {
        enabled: true,
      },
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Search recipes successfully retrieved',
      schema: successApiSchemaRef(PaginatedSearchRecipesApiModel),
    }),
    ApiValidationExceptionResponse([
      {
        property: 'filter.difficulty',
        value: 'INVALID_DIFFICULTY',
        constraints: {
          isEnum: `Field filter.difficulty must be one of the allowed values: ${Object.values(RecipeDifficultyKey).join(', ')}.`,
        },
      },
      {
        property: 'filter.maxCookingTimeMinutes',
        value: -1,
        constraints: {
          min: 'Field filter.maxCookingTimeMinutes must not be less than 0.',
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
        constraints: { max: 'Field pagination.limit must be less or equals to 100.' },
      },
    ]),
  )
}
