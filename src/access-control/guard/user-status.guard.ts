import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { User } from '@prisma/client'
import { Request } from 'express'
import { ONLY_ACTIVE_STATUS } from '@access-control/decorator'
import { StatusPolicy } from '@access-control/util'

@Injectable()
export class UserStatusGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): Promise<boolean> {
    const onlyActiveStatus = <boolean>(
      (this.reflector.get(ONLY_ACTIVE_STATUS, context.getClass()) ??
        this.reflector.get(ONLY_ACTIVE_STATUS, context.getHandler()) ??
        false)
    )
    const req = context.switchToHttp().getRequest() as Request
    const user = <User>req.user
    return StatusPolicy.enforce(user, onlyActiveStatus)
  }
}
