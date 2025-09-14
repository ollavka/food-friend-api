import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { isEmail } from 'class-validator'
import { isUuid } from '@common/util'
import { PrismaService } from '@infrastructure/database'
import { CreateUserPayload, FindUserOptions } from '../type'

@Injectable()
export class UserService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findById<T extends FindUserOptions>(
    id: string,
    options?: T,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.UserGetPayload<T> | null> {
    const db = tx ?? this.prismaService
    const user = await db.user.findUnique({
      where: { id },
      ...options,
    })

    return user as Prisma.UserGetPayload<T>
  }

  public async findByEmail<T extends FindUserOptions>(
    email: string,
    options?: T,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.UserGetPayload<T> | null> {
    const db = tx ?? this.prismaService
    const user = await db.user.findUnique({
      where: { email },
      ...options,
    })

    return user as Prisma.UserGetPayload<T>
  }

  public async create(payload: CreateUserPayload, tx?: Prisma.TransactionClient): Promise<User> {
    const db = tx ?? this.prismaService
    const newUser = await db.user.create({
      data: payload,
    })

    return newUser
  }

  public async findOrCreate(
    idOrEmail: string,
    payload: Omit<CreateUserPayload, 'lastEmailVerificationMailSentAt' | 'lastResetPasswordMailSentAt'>,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const findBy = isUuid(idOrEmail) ? this.findById : this.findByEmail
    const foundUser = await findBy(idOrEmail, {}, tx)

    if (foundUser) {
      return foundUser
    }

    const createdUser = await this.create(
      {
        ...payload,
        lastEmailVerificationMailSentAt: null,
        lastResetPasswordMailSentAt: null,
      },
      tx,
    )

    return createdUser
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
