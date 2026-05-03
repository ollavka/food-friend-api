import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AppEntityNotFoundException } from '@common/exception'
import { UserController } from './user.controller'

describe('UserController', () => {
  const userService: any = {
    findById: jest.fn(),
    upsertNutritionProfile: jest.fn(),
  }

  let controller: UserController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new UserController(userService)
  })

  it('should return current user model', () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'REGULAR',
      isEmailVerified: true,
      hasPassword: true,
    }

    const result = controller.getMe(user as never)

    expect(result.email).toBe('user@example.com')
  })

  it('should get user by id and throw when not found', async () => {
    userService.findById.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'REGULAR',
      isEmailVerified: true,
      hasPassword: true,
    })

    const user = await controller.getUser('user-1' as never)
    expect(user.id).toBe('user-1')

    userService.findById.mockResolvedValueOnce(null)
    await expect(controller.getUser('user-2' as never)).rejects.toBeInstanceOf(AppEntityNotFoundException)
  })

  it('should upsert nutrition profile', async () => {
    userService.upsertNutritionProfile.mockResolvedValue({
      id: 'profile-1',
      userId: 'user-1',
      sex: 'MALE',
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activityLevel: 'MODERATE',
      goal: 'MAINTAIN_WEIGHT',
      targetCalories: 2200,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await controller.upsertNutritionProfile(
      { id: 'user-1' } as never,
      {
        sex: 'MALE',
        age: 30,
        heightCm: 180,
        weightKg: 80,
        activityLevel: 'MODERATE',
        goal: 'MAINTAIN_WEIGHT',
        targetCalories: 2200,
      } as never,
    )

    expect(userService.upsertNutritionProfile).toHaveBeenCalled()
    expect(result.userId).toBe('user-1')
  })
})
