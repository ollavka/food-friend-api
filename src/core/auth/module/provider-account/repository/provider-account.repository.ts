import { Injectable } from '@nestjs/common'
import { Account, AuthProvider, Prisma, User } from '@prisma/client'
import { Uuid } from '@common/type'
import { PrismaService } from '@infrastructure/database'

@Injectable()
export class ProviderAccountRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findByUserId(
    userId: Uuid,
    provider: AuthProvider,
    tx?: Prisma.TransactionClient,
  ): Promise<Account | null> {
    const db = tx ?? this.prismaService
    const account = await db.account.findUnique({
      where: {
        provider_userId: {
          provider,
          userId,
        },
      },
    })

    return account
  }

  public async findById(id: Uuid, provider: AuthProvider, tx?: Prisma.TransactionClient): Promise<Account | null> {
    const db = tx ?? this.prismaService
    const account = await db.account.findUnique({
      where: {
        id,
        provider,
      },
    })

    return account
  }

  public async findBySubjectId(
    subjectId: string,
    provider: AuthProvider,
    tx?: Prisma.TransactionClient,
  ): Promise<Account | null> {
    const db = tx ?? this.prismaService
    const account = db.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: subjectId,
        },
      },
    })

    return account
  }

  public async create(
    subjectId: string,
    provider: AuthProvider,
    user: User,
    tx?: Prisma.TransactionClient,
  ): Promise<Account> {
    const db = tx ?? this.prismaService
    const account = await db.account.create({
      data: {
        provider,
        providerAccountId: subjectId,
        email: user.email,
        user: {
          connect: { id: user.id },
        },
      },
    })

    return account
  }

  public async remove(userId: Uuid, provider: AuthProvider): Promise<void> {
    await this.prismaService.account.delete({
      where: {
        provider_userId: {
          provider,
          userId,
        },
      },
    })
  }
}
