import { Prisma } from '@prisma/client'

export type FindUserOptions = Omit<Prisma.UserFindUniqueArgs, 'where'>
