import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiBadRequestExceptionResponse,
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiUserStatusPolicyExceptionResponse,
} from '@swagger/decorator'

export function UnlinkGoogleAccountDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Unlink Google account from existed user',
      description: 'Unlink Google account from existing user',
    }),
    ApiOkResponse({
      description: 'Message about successful unlink Google account',
      example: {
        status: 'success',
        data: {
          message: 'Google account has been successfully unlinked from your account.',
        },
      },
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiUserStatusPolicyExceptionResponse(),
    ApiBadRequestExceptionResponse({
      description: 'It is impossible to unlink the provider, as there are no other ways to authorize',
      details: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
        example: {
          reason: 'It is impossible to unlink the provider, as there are no other ways to authorize.',
        },
      },
    }),
  )
}
