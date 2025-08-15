import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { User, UserRole } from '@prisma/client'
import { Request } from 'express'
import { AccessControlAuthorizationException } from '@access-control/exception'
import { ROLES_KEY } from '../decorator/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const req = context.switchToHttp().getRequest() as Request
    const user = <User>req.user
    const hasRequiredRole = requiredRoles.some((role) => user.role.includes(role))

    if (hasRequiredRole) {
      return true
    }

    const formattedRequiredRoles = requiredRoles.join(', ')
    throw new AccessControlAuthorizationException(
      'roles',
      `To access the resource, you must have one of the following roles: ${formattedRequiredRoles}`,
    )
  }
}
