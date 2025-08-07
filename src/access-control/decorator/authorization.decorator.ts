import { UseGuards, applyDecorators } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { JwtAuthGuard, RolesGuard } from '../guard'
import { Roles } from './roles.decorator'

export function Authorization(...roles: UserRole[]): ReturnType<typeof applyDecorators> {
  const hasRoles = roles.length > 0
  const decorators = hasRoles ? [UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles)] : [UseGuards(JwtAuthGuard)]
  return applyDecorators(...decorators)
}
