import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { RecipeDifficultyKey } from '@prisma/client'
import {
  ApiBadRequestExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiLanguage,
  ApiResourceQuery,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { RecipeRecommendationsApiModel } from '../api-model'
import { RecipeRecommendationsQueryDto } from '../dto'

export function GetRecipeRecommendationsDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve personalized recipe recommendations',
      description: 'Return recipe recommendations for current user based on nutrition profile and recipe nutrition.',
    }),
    ApiResourceQuery<RecipeRecommendationsQueryDto>({
      filter: {
        fields: {
          limit: {
            description: 'Maximum recommendations to return',
            example: 10,
          },
          maxCookingTimeMinutes: {
            description: 'Maximum cooking time in minutes',
            example: 45,
          },
          difficulty: {
            description: 'Filter by recipe difficulty',
            enum: RecipeDifficultyKey,
            example: RecipeDifficultyKey.MEDIUM,
          },
        },
      },
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Recipe recommendations successfully retrieved',
      schema: successApiSchemaRef(RecipeRecommendationsApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'limit',
        value: 0,
        constraints: { min: 'Field limit must not be less than 1.' },
      },
      {
        property: 'maxCookingTimeMinutes',
        value: 0,
        constraints: { min: 'Field maxCookingTimeMinutes must not be less than 1.' },
      },
      {
        property: 'difficulty',
        value: 'INVALID',
        constraints: {
          isEnum: `Field difficulty must be one of the allowed values: ${Object.values(RecipeDifficultyKey).join(', ')}.`,
        },
      },
    ]),
    ApiBadRequestExceptionResponse({
      description: 'Recommendation request is invalid',
      variants: [
        {
          typeKey: 'bad-request.recipe.recommendation-profile-required',
          summary: 'User has no nutrition profile',
          example: {
            reason: 'Nutrition profile is required for personalized recommendations.',
          },
        },
      ],
    }),
  )
}
