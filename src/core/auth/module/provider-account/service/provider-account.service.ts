import { Injectable } from '@nestjs/common'
import { Account, AuthProvider, Prisma, User } from '@prisma/client'
import { TokenPayload } from 'google-auth-library'
import { AppConflictException } from '@common/exception'
import { Nullable, Uuid } from '@common/type'
import { capitalize } from '@common/util'
import { ProviderAccountRepository } from '../repository'

@Injectable()
export class ProviderAccountService {
  public constructor(private readonly providerAccountRepository: ProviderAccountRepository) {}

  public async findAccountByUserId(
    userId: Uuid,
    provider: AuthProvider,
    tx?: Prisma.TransactionClient,
  ): Promise<Account | null> {
    const account = await this.providerAccountRepository.findByUserId(userId, provider, tx)
    return account
  }

  public async findAccountById(
    accountId: Uuid,
    provider: AuthProvider,
    tx?: Prisma.TransactionClient,
  ): Promise<Account | null> {
    const account = await this.providerAccountRepository.findById(accountId, provider, tx)
    return account
  }

  public async findAccountBySubjectId(
    subjectId: string,
    provider: AuthProvider,
    tx?: Prisma.TransactionClient,
  ): Promise<Account | null> {
    const account = await this.providerAccountRepository.findBySubjectId(subjectId, provider, tx)
    return account
  }

  public async createAccount(
    subjectId: string,
    provider: AuthProvider,
    user: User,
    tx?: Prisma.TransactionClient,
  ): Promise<Account> {
    const account = await this.providerAccountRepository.create(subjectId, provider, user, tx)
    return account
  }

  public async findOrCreate(
    payload: TokenPayload,
    provider: AuthProvider,
    user: User,
    tx?: Prisma.TransactionClient,
    strict = true,
  ): Promise<Account> {
    const existingBySub = await this.findAccountBySubjectId(payload.sub, provider, tx)

    if (existingBySub) {
      if (!strict) {
        return existingBySub
      }

      this.validateLinkAccount(existingBySub, user.id, payload.email, provider)
    }

    const existingByUser = await this.findAccountByUserId(user.id, provider, tx)

    if (existingByUser) {
      if (!strict) {
        return existingByUser
      }

      this.validateLinkAccount(existingByUser, user.id, payload.email, provider)
    }

    return await this.createAccount(payload.sub, provider, user, tx)
  }

  public async removeAccount(userId: Uuid, provider: AuthProvider): Promise<void> {
    await this.providerAccountRepository.remove(userId, provider)
  }

  private validateLinkAccount(
    account: Account,
    userId: Uuid,
    payloadEmail: Nullable<string>,
    provider: AuthProvider,
  ): void {
    const providerLabel = capitalize(provider)

    if (account.userId !== userId) {
      throw new AppConflictException(
        'provider-account.linked-to-another-user',
        `This ${providerLabel} account is linked to another user.`,
      )
    }

    if (account.email === payloadEmail) {
      throw new AppConflictException(
        'provider-account.already-linked',
        `You already has a ${providerLabel} account linked.`,
      )
    }
  }
}
