import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ApiBearerAccessTokenAuth, ApiBearerAuthExceptionResponse } from '@swagger/decorator'
import { successApiSchemaLiteral } from '@swagger/util'

export function LogoutDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Log out', description: 'Invalidates the current refresh token (server-side)' }),
    ApiOkResponse({
      description: 'Logged out and refresh token invalidated',
      schema: successApiSchemaLiteral(null),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
  )
}
