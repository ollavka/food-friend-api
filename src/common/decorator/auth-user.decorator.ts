import { createParamDecorator } from '@nestjs/common'
import { User } from '@prisma/client'
import { Request } from 'express'

export const AuthUser = createParamDecorator((key: keyof User, ctx) => {
  const req = ctx.switchToHttp().getRequest() as Request
  const user = req.user ?? null
  return key ? user?.[key] : user
})
