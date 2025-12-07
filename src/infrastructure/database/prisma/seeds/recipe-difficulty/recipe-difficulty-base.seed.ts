import { PrismaClient, RecipeDifficultyKey } from '@prisma/client'
import { SeededRecipeDifficultyMap } from './type'

export async function seedRecipeDifficultiesBase(prisma: PrismaClient): Promise<SeededRecipeDifficultyMap> {
  // eslint-disable-next-line no-console
  console.log('Seeding recipe difficulties...')

  const [easyDifficulty, mediumDifficulty, hardDifficulty] = await Promise.all([
    prisma.recipeDifficulty.upsert({
      where: {
        key: RecipeDifficultyKey.EASY,
      },
      create: {
        key: RecipeDifficultyKey.EASY,
      },
      update: {
        key: RecipeDifficultyKey.EASY,
      },
    }),
    prisma.recipeDifficulty.upsert({
      where: {
        key: RecipeDifficultyKey.MEDIUM,
      },
      create: {
        key: RecipeDifficultyKey.MEDIUM,
      },
      update: {
        key: RecipeDifficultyKey.MEDIUM,
      },
    }),
    prisma.recipeDifficulty.upsert({
      where: {
        key: RecipeDifficultyKey.HARD,
      },
      create: {
        key: RecipeDifficultyKey.HARD,
      },
      update: {
        key: RecipeDifficultyKey.HARD,
      },
    }),
  ])

  // eslint-disable-next-line no-console
  console.log('Recipe difficulties seeded ✅')

  return {
    [RecipeDifficultyKey.EASY]: easyDifficulty,
    [RecipeDifficultyKey.MEDIUM]: mediumDifficulty,
    [RecipeDifficultyKey.HARD]: hardDifficulty,
  }
}
