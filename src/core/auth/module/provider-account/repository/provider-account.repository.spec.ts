import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AuthProvider } from '@prisma/client'
import { ProviderAccountRepository } from './provider-account.repository'

const USER_ID = '11111111-1111-4111-8111-111111111111'

describe('ProviderAccountRepository', () => {
  const prismaService: any = {
    account: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  }

  let repository: ProviderAccountRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new ProviderAccountRepository(prismaService)
  })

  it('should find account by user id, id and subject id', async () => {
    await repository.findByUserId(USER_ID as never, AuthProvider.GOOGLE)
    await repository.findById('account-id' as never, AuthProvider.GOOGLE)
    await repository.findBySubjectId('subject-id', AuthProvider.GOOGLE)

    expect(prismaService.account.findUnique).toHaveBeenNthCalledWith(1, {
      where: {
        provider_userId: {
          provider: AuthProvider.GOOGLE,
          userId: USER_ID,
        },
      },
    })
    expect(prismaService.account.findUnique).toHaveBeenNthCalledWith(2, {
      where: {
        id: 'account-id',
        provider: AuthProvider.GOOGLE,
      },
    })
    expect(prismaService.account.findUnique).toHaveBeenNthCalledWith(3, {
      where: {
        provider_providerAccountId: {
          provider: AuthProvider.GOOGLE,
          providerAccountId: 'subject-id',
        },
      },
    })
  })

  it('should create provider account and remove it', async () => {
    prismaService.account.create.mockResolvedValue({ id: 'account-id' })

    await repository.create('subject-id', AuthProvider.GOOGLE, {
      id: USER_ID,
      email: 'user@example.com',
    } as never)

    await repository.remove(USER_ID as never, AuthProvider.GOOGLE)

    expect(prismaService.account.create).toHaveBeenCalledWith({
      data: {
        provider: AuthProvider.GOOGLE,
        providerAccountId: 'subject-id',
        email: 'user@example.com',
        user: {
          connect: { id: USER_ID },
        },
      },
    })
    expect(prismaService.account.delete).toHaveBeenCalledWith({
      where: {
        provider_userId: {
          provider: AuthProvider.GOOGLE,
          userId: USER_ID,
        },
      },
    })
  })
})
