import { UseGuards, applyDecorators } from '@nestjs/common'
import { JwtAuthGuard } from '@core/auth/guard'

export function Authorization(): ReturnType<typeof applyDecorators> {
  return applyDecorators(UseGuards(JwtAuthGuard))
}
