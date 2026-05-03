import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AuthProvider } from '@prisma/client'
import { AppConflictException } from '@common/exception'
import { ProviderAccountService } from './provider-account.service'

const USER_ID = '11111111-1111-4111-8111-111111111111'

describe('ProviderAccountService', () => {
  const repository: any = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
    findBySubjectId: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  }

  let service: ProviderAccountService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ProviderAccountService(repository)
  })

  it('should delegate find and remove operations', async () => {
    await service.findAccountByUserId(USER_ID as never, AuthProvider.GOOGLE)
    await service.findAccountById('account-id' as never, AuthProvider.GOOGLE)
    await service.findAccountBySubjectId('subject-id', AuthProvider.GOOGLE)
    await service.removeAccount(USER_ID as never, AuthProvider.GOOGLE)

    expect(repository.findByUserId).toHaveBeenCalled()
    expect(repository.findById).toHaveBeenCalled()
    expect(repository.findBySubjectId).toHaveBeenCalled()
    expect(repository.remove).toHaveBeenCalledWith(USER_ID, AuthProvider.GOOGLE)
  })

  it('should create account directly', async () => {
    repository.create.mockResolvedValue({ id: 'account-id' })

    const account = await service.createAccount('subject-id', AuthProvider.GOOGLE, {
      id: USER_ID,
      email: 'user@example.com',
    } as never)

    expect(account).toEqual({ id: 'account-id' })
    expect(repository.create).toHaveBeenCalled()
  })

  it('should return existing account in non-strict mode', async () => {
    repository.findBySubjectId.mockResolvedValue({ id: 'existing-account-id', userId: USER_ID })

    const account = await service.findOrCreate(
      { sub: 'subject-id', email: 'user@example.com' } as never,
      AuthProvider.GOOGLE,
      { id: USER_ID, email: 'user@example.com' } as never,
      undefined,
      false,
    )

    expect(account).toEqual({ id: 'existing-account-id', userId: USER_ID })
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('should throw when account is linked to another user', async () => {
    repository.findBySubjectId.mockResolvedValue({
      id: 'existing-account-id',
      userId: 'another-user-id',
      email: 'another@example.com',
    })

    await expect(
      service.findOrCreate({ sub: 'subject-id', email: 'user@example.com' } as never, AuthProvider.GOOGLE, {
        id: USER_ID,
        email: 'user@example.com',
      } as never),
    ).rejects.toBeInstanceOf(AppConflictException)
  })

  it('should throw when provider account is already linked to same email', async () => {
    repository.findBySubjectId.mockResolvedValue({
      id: 'existing-account-id',
      userId: USER_ID,
      email: 'user@example.com',
    })

    await expect(
      service.findOrCreate({ sub: 'subject-id', email: 'user@example.com' } as never, AuthProvider.GOOGLE, {
        id: USER_ID,
        email: 'user@example.com',
      } as never),
    ).rejects.toBeInstanceOf(AppConflictException)
  })

  it('should create new account when no existing records', async () => {
    repository.findBySubjectId.mockResolvedValue(null)
    repository.findByUserId.mockResolvedValue(null)
    repository.create.mockResolvedValue({ id: 'new-account-id' })

    const account = await service.findOrCreate(
      { sub: 'subject-id', email: 'user@example.com' } as never,
      AuthProvider.GOOGLE,
      { id: USER_ID, email: 'user@example.com' } as never,
    )

    expect(account).toEqual({ id: 'new-account-id' })
    expect(repository.create).toHaveBeenCalledWith(
      'subject-id',
      AuthProvider.GOOGLE,
      { id: USER_ID, email: 'user@example.com' },
      undefined,
    )
  })
})
