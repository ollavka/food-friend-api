/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { CanActivate, UseGuards, applyDecorators } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { RolesGuard, UserStatusGuard } from '@access-control/guard'
import { UniversalDecorator } from '@common/type'
import { useOnlyIf } from '@common/util'
import { JwtAuthGuard } from '@core/auth/guard'
import { OnlyActiveStatus } from './only-active-status.decorator'
import { Roles } from './roles.decorator'

type AuthorizationParams = {
  roles?: UserRole[]
  onlyActiveStatus?: boolean
}

export function Authorization(params?: AuthorizationParams): UniversalDecorator {
  const roles = params?.roles ?? []
  const onlyActiveStatus = params?.onlyActiveStatus ?? false

  const hasRoles = roles.length > 0

  const guards = <Array<CanActivate | Function>>(
    [JwtAuthGuard, UserStatusGuard, useOnlyIf(RolesGuard, hasRoles)].filter(Boolean)
  )
  const extraDecorators = <Array<UniversalDecorator>>(
    [useOnlyIf(OnlyActiveStatus(), onlyActiveStatus), useOnlyIf(Roles(...roles), hasRoles)].filter(Boolean)
  )

  return applyDecorators(UseGuards(...guards), ...extraDecorators)
}
