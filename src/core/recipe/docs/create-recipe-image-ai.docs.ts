import { applyDecorators } from '@nestjs/common'
import { ApiAcceptedResponse, ApiBody, ApiOperation } from '@nestjs/swagger'
import { BackgroundJobApiModel } from '@core/background-job/api-model'
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
import { CreateRecipeImageDto } from '../dto'

export function CreateRecipeImageAiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Generate recipe image',
      description: 'Create asynchronous AI job that generates image for existing recipe.',
    }),
    ApiBody({ type: CreateRecipeImageDto, required: true }),
    ApiLanguage(),
    ApiAcceptedResponse({
      description: 'Background job has been successfully created',
      schema: successApiSchemaRef(BackgroundJobApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiAuthorizationExceptionResponse({
      description: 'Current user cannot generate image for requested recipe',
      variants: [
        {
          typeKey: 'forbidden',
          summary: 'Only recipe owner or admin can generate recipe image',
          example: {
            reason: 'Access denied. Please contact support.',
          },
        },
      ],
    }),
    ApiValidationExceptionResponse([
      {
        property: 'recipeId',
        value: 'invalid-id',
        constraints: { isId: 'Field recipeId must be a valid identifier.' },
      },
      {
        property: 'prompt',
        value: 123,
        constraints: { isString: 'Field prompt must be text.' },
      },
    ]),
    ApiBadRequestExceptionResponse({
      description: 'Recipe image generation request is invalid',
      variants: [
        {
          typeKey: 'bad-request.ai.recipe-id-required',
          summary: 'Recipe id is not provided',
          example: {
            reason: 'Recipe id is required for image generation.',
          },
        },
        {
          typeKey: 'bad-request.ai.recipe-image-status',
          summary: 'Recipe has unsupported status for image generation',
          example: {
            reason: 'Image generation is not available for archived recipe.',
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
