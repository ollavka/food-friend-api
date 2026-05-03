import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ApiBearerAccessTokenAuth, ApiBearerAuthExceptionResponse } from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { UserApiModel } from '../api-model'

export function GetCurrentUserDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Get current user profile',
      description: 'Returns authenticated user profile details.',
    }),
    ApiOkResponse({
      description: 'Current user profile retrieved successfully',
      schema: successApiSchemaRef(UserApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
  )
}
