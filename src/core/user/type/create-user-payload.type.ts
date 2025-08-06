import { User } from '@prisma/client'

export type CreateUserPayload = Omit<User, 'createdAt' | 'updatedAt' | 'id' | 'password'> & {
  password?: string
}
