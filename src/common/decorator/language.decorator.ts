import { createParamDecorator } from '@nestjs/common'
import { LanguageCode } from '@prisma/client'
import { Request } from 'express'
import { getRequestLanguage } from '@common/util'

export const Language = createParamDecorator((data: { fallback?: LanguageCode }, ctx) => {
  const req = ctx.switchToHttp().getRequest() as Request
  const fallback = data?.fallback
  return getRequestLanguage(req, { fallback })
})
