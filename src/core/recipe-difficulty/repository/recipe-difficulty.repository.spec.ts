import { describe, expect, it, jest } from '@jest/globals'
import { RecipeDifficultyKey } from '@prisma/client'
import { RecipeDifficultyRepository } from './recipe-difficulty.repository'

describe('RecipeDifficultyRepository', () => {
  const createRepository = (): { repository: RecipeDifficultyRepository; prismaService: any } => {
    const prismaService: any = {
      recipeDifficulty: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    }

    const repository = new RecipeDifficultyRepository(prismaService as any)
    return { repository, prismaService }
  }

  it('should find all recipe difficulties with translations by language', async () => {
    const { repository, prismaService } = createRepository()
    prismaService.recipeDifficulty.findMany.mockResolvedValue([])

    await repository.findAllRecipeDifficulties({ id: 'language-id' } as any)

    expect(prismaService.recipeDifficulty.findMany).toHaveBeenCalledWith({
      include: {
        translations: {
          where: { languageId: 'language-id' },
        },
      },
    })
  })

  it('should find recipe difficulty by key', async () => {
    const { repository, prismaService } = createRepository()

    await repository.findRecipeDifficultyByKey(RecipeDifficultyKey.EASY)

    expect(prismaService.recipeDifficulty.findUnique).toHaveBeenCalledWith({
      where: { key: RecipeDifficultyKey.EASY },
    })
  })
})
