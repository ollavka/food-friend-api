import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { isEmail } from 'class-validator'
import { PrismaService } from '@infrastructure/database'
import { CreateUserPayload, FindUserOptions } from '../type'

@Injectable()
export class UserService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findById(id: string, options?: FindUserOptions, tx?: Prisma.TransactionClient): Promise<User | null> {
    const db = tx ?? this.prismaService
    const user = await db.user.findUnique({
      where: { id },
      ...options,
    })

    return user
  }

  public async findByEmail(
    email: string,
    options?: FindUserOptions,
    tx?: Prisma.TransactionClient,
  ): Promise<User | null> {
    const db = tx ?? this.prismaService
    const user = await db.user.findUnique({
      where: { email },
      ...options,
    })

    return user
  }

  public async create(payload: CreateUserPayload, tx?: Prisma.TransactionClient): Promise<User> {
    const db = tx ?? this.prismaService
    const newUser = await db.user.create({
      data: payload,
    })

    return newUser
  }

  public async update(idOrEmail: string, data: Prisma.UserUpdateInput, tx?: Prisma.TransactionClient): Promise<User> {
    const db = tx ?? this.prismaService
    const where = isEmail(idOrEmail) ? { email: idOrEmail } : { id: idOrEmail }

    const updatedUser = await db.user.update({
      where,
      data,
    })

    return updatedUser
  }
}
