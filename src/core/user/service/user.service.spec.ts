import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { NutritionActivityLevel, NutritionGoal, NutritionSex } from '@prisma/client'
import { UserService } from './user.service'

const USER_ID = '11111111-1111-4111-8111-111111111111'
const NOW = new Date('2026-01-01T00:00:00.000Z')

describe('UserService', () => {
  const prismaService: any = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userNutritionProfile: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  }

  let service: UserService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new UserService(prismaService)
  })

  it('should find user by id and by email', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({ id: USER_ID }).mockResolvedValueOnce({ email: 'a@a.com' })

    expect(await service.findById(USER_ID)).toEqual({ id: USER_ID })
    expect(await service.findByEmail('a@a.com')).toEqual({ email: 'a@a.com' })
  })

  it('should find or create user', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce(null)
    prismaService.user.create.mockResolvedValue({ id: USER_ID, email: 'a@a.com' })

    const created = await service.findOrCreate('a@a.com', {
      email: 'a@a.com',
      firstName: 'A',
      lastName: 'B',
      passwordHash: null,
    } as never)

    expect(created.id).toBe(USER_ID)
    expect(prismaService.user.create).toHaveBeenCalled()

    prismaService.user.findUnique.mockResolvedValueOnce({ id: USER_ID, email: 'a@a.com' })
    const existing = await service.findOrCreate(USER_ID, {
      email: 'a@a.com',
      firstName: 'A',
      lastName: 'B',
      passwordHash: null,
    } as never)

    expect(existing.id).toBe(USER_ID)
  })

  it('should update user by id or email', async () => {
    prismaService.user.update.mockResolvedValue({ id: USER_ID })

    await service.update(USER_ID, { firstName: 'Name' })
    await service.update('user@example.com', { firstName: 'Name' })

    expect(prismaService.user.update).toHaveBeenNthCalledWith(1, expect.objectContaining({ where: { id: USER_ID } }))
    expect(prismaService.user.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { email: 'user@example.com' } }),
    )
  })

  it('should get and upsert nutrition profile', async () => {
    prismaService.userNutritionProfile.findUnique.mockResolvedValue({
      id: 'profile-id',
      userId: USER_ID,
      sex: NutritionSex.MALE,
      age: 30,
      heightCm: 180,
      weightKg: '80.5',
      activityLevel: NutritionActivityLevel.MODERATE,
      goal: NutritionGoal.MAINTAIN_WEIGHT,
      targetCalories: 2200,
      createdAt: NOW,
      updatedAt: NOW,
    })

    const profile = await service.getNutritionProfileByUserId(USER_ID)
    expect(profile?.weightKg).toBe(80.5)

    prismaService.userNutritionProfile.upsert.mockResolvedValue({
      id: 'profile-id',
      userId: USER_ID,
      sex: NutritionSex.FEMALE,
      age: 28,
      heightCm: 170,
      weightKg: '65.2',
      activityLevel: NutritionActivityLevel.LIGHT,
      goal: NutritionGoal.LOSE_WEIGHT,
      targetCalories: 1700,
      createdAt: NOW,
      updatedAt: NOW,
    })

    const updated = await service.upsertNutritionProfile(USER_ID, {
      sex: NutritionSex.FEMALE,
      age: 28,
      heightCm: 170,
      weightKg: 65.2,
      activityLevel: NutritionActivityLevel.LIGHT,
      goal: NutritionGoal.LOSE_WEIGHT,
      targetCalories: 1700,
    })

    expect(updated.sex).toBe(NutritionSex.FEMALE)
    expect(updated.weightKg).toBe(65.2)
  })
})
