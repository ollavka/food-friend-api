import { Controller } from '@nestjs/common'
import { Language, RecipeDifficulty, RecipeDifficultyKey, RecipeDifficultyTranslation } from '@prisma/client'
import { PrismaService } from '@infrastructure/database'

@Controller()
export class RecipeDifficultyRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findAllRecipeDifficulties(
    language: Language,
  ): Promise<Array<RecipeDifficulty & { translations: RecipeDifficultyTranslation[] }>> {
    return this.prismaService.recipeDifficulty.findMany({
      include: {
        translations: {
          where: {
            languageId: language.id,
          },
        },
      },
    })
  }

  public async findRecipeDifficultyByKey(key: RecipeDifficultyKey): Promise<RecipeDifficulty | null> {
    return this.prismaService.recipeDifficulty.findUnique({
      where: {
        key,
      },
    })
  }
}
