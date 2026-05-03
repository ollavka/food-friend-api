import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiAppEntityNotFoundExceptionResponse,
  ApiAuthorizationExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { BackgroundJobApiModel } from '../api-model'

export function GetBackgroundJobByIdDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve background job by id',
      description: 'Retrieve background job status for current user',
    }),
    ApiOkResponse({
      description: 'Background job successfully retrieved',
      schema: successApiSchemaRef(BackgroundJobApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'id',
        value: 'invalid-id',
        constraints: { isId: 'Field id must be a valid identifier.' },
      },
    ]),
    ApiAuthorizationExceptionResponse({
      description: 'Current user has no access to requested background job',
      variants: [
        {
          typeKey: 'forbidden',
          summary: 'Only background job owner or admin can access job',
          example: {
            reason: 'Access denied. Please contact support.',
          },
        },
      ],
    }),
    ApiAppEntityNotFoundExceptionResponse({
      description: 'Background job not found',
      entityType: 'BackgroundJob',
      identity: { id: 'LnT8BAUhhoJ2Y6MuB9AAZp' },
    }),
  )
}
