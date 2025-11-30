import type { User as UserEntity } from '@prisma/client'
import { LanguageCode } from '@prisma/client'

declare global {
  namespace Express {
    interface User extends UserEntity {
      languageCode?: LanguageCode | null
    }

    interface Request {
      user?: Express.User
      defaultLanguageCode?: LanguageCode | null
    }
  }
}

export {}
