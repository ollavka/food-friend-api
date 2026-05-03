import { applyDecorators } from '@nestjs/common'
import { ApiAcceptedResponse, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger'
import { BackgroundJobApiModel } from '@core/background-job/api-model'
import {
  ApiBadRequestExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiLanguage,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { CreateRecipeFromPhotoDto } from '../dto'

export function CreateRecipeFromPhotoAiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Create recipe from photo',
      description: 'Create asynchronous AI job that analyzes a recipe photo and creates draft recipe.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: CreateRecipeFromPhotoDto, required: true }),
    ApiLanguage(),
    ApiAcceptedResponse({
      description: 'Background job has been successfully created',
      schema: successApiSchemaRef(BackgroundJobApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'imageUrl',
        value: 123,
        constraints: { isString: 'Field imageUrl must be text.' },
      },
      {
        property: 'prompt',
        value: 123,
        constraints: { isString: 'Field prompt must be text.' },
      },
    ]),
    ApiBadRequestExceptionResponse({
      description: 'Photo source is invalid',
      variants: [
        {
          typeKey: 'bad-request.ai.photo-source-required',
          summary: 'Neither file nor imageUrl was provided',
          example: {
            reason: 'Provide recipe photo file or imageUrl.',
          },
        },
        {
          typeKey: 'bad-request.ai.image-url-invalid',
          summary: 'Image URL format is invalid',
          example: {
            reason: 'Provided imageUrl is invalid.',
          },
        },
        {
          typeKey: 'bad-request.ai.image-url-forbidden',
          summary: 'Image URL is not allowed for security reasons',
          example: {
            reason: 'Provided imageUrl is forbidden.',
          },
        },
        {
          typeKey: 'bad-request.ai.image-content-type',
          summary: 'Image content type is invalid',
          example: {
            reason: 'Only image content type is supported.',
          },
        },
        {
          typeKey: 'bad-request.ai.image-size-limit',
          summary: 'Image is too large',
          example: {
            reason: 'Image exceeds maximum allowed size.',
          },
        },
      ],
    }),
  )
}
