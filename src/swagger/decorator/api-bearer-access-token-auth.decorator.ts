import { ApiBearerAuth } from '@nestjs/swagger'

export function ApiBearerAccessTokenAuth(): MethodDecorator {
  return ApiBearerAuth('Access token')
}
