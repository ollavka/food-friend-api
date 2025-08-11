import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { TokenType } from './token.type'

export type ActionTokenDelegate = Prisma.ActionTokenDelegate<DefaultArgs, Prisma.PrismaClientOptions>
export type RefreshTokenDelegate = Prisma.RefreshTokenDelegate<DefaultArgs, Prisma.PrismaClientOptions>
export type TokenDelegate = TokenType extends 'refreshToken' ? RefreshTokenDelegate : ActionTokenDelegate
