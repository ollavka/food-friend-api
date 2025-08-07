import { User } from '@prisma/client'

export type JwtUserPayload = Pick<User, 'id'>
