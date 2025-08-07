import { createParamDecorator } from '@nestjs/common'
import { User } from '@prisma/client'
import { Request } from 'express'

export const AuthorizedUser = createParamDecorator((key: keyof User, context) => {
  const req = context.switchToHttp().getRequest() as Request
  const user = req.user ?? null
  return key ? user?.[key] : user
})
