import { applyDecorators } from '@nestjs/common'
import { ApiAcceptedResponse, ApiBody, ApiOperation } from '@nestjs/swagger'
import { BackgroundJobApiModel } from '@core/background-job/api-model'
import {
  ApiAuthorizationExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiArraySchemaRef } from '@swagger/util'
import { SearchReindexDto } from '../dto'

export function SearchReindexDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Create search reindex jobs',
      description:
        'Create background jobs for full product and/or recipe search index reindexing. Available only for admins.',
    }),
    ApiBody({
      type: SearchReindexDto,
      required: false,
    }),
    ApiAcceptedResponse({
      description: 'Search reindex jobs successfully created',
      schema: successApiArraySchemaRef(BackgroundJobApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiAuthorizationExceptionResponse({
      description: 'Access denied',
      variants: [
        {
          typeKey: 'forbidden',
          summary: 'Only admin can create search reindex jobs',
          example: {
            reason: 'Access denied. Please contact support.',
          },
        },
      ],
    }),
    ApiValidationExceptionResponse([
      {
        property: 'entities',
        value: [],
        constraints: {
          arrayMinSize: 'Field entities must contain at least 1 elements.',
        },
      },
      {
        property: 'entities.0',
        value: 'UNKNOWN',
        constraints: {
          isEnum: 'Field entities.0 must be one of the allowed values: PRODUCTS, RECIPES.',
        },
      },
    ]),
  )
}
