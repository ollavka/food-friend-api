/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { CanActivate, UseGuards, applyDecorators } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { RolesGuard, VerifiedGuard } from '@access-control/guard'
import { UniversalDecorator } from '@common/type'
import { JwtAuthGuard } from '@core/auth/guard'
import { Roles } from './roles.decorator'

type AuthorizationDecoratorParams = {
  roles?: UserRole[]
  verified?: boolean
}

export function Authorization(params?: AuthorizationDecoratorParams): UniversalDecorator {
  const roles = params?.roles ?? []
  const verified = params?.verified ?? false
  const hasRoles = roles.length > 0

  const guards = <Array<CanActivate | Function>>[
    [JwtAuthGuard, true],
    [RolesGuard, hasRoles],
    [VerifiedGuard, verified],
  ]
    .map(([guard, isAvailable]) => (isAvailable ? guard : null))
    .filter(Boolean)

  const extraDecorators = <Array<UniversalDecorator>>(
    [[Roles(...roles), hasRoles]].map(([decorator, isAvailable]) => (isAvailable ? decorator : null)).filter(Boolean)
  )

  const fullDecoratorList = [...(guards.length > 0 ? [UseGuards(...guards)] : []), ...extraDecorators]
  return applyDecorators(...fullDecoratorList)
}
