import { Injectable } from '@nestjs/common'
import { LanguageCode } from '@prisma/client'
import { LanguageService } from '@core/language'
import { RecipeDifficultyApiModel } from '../api-model'
import { RecipeDifficultyRepository } from '../repository'

@Injectable()
export class RecipeDifficultyService {
  public constructor(
    private readonly recipeDifficultyRepository: RecipeDifficultyRepository,
    private readonly languageService: LanguageService,
  ) {}

  public async getAllRecipeDifficulties(languageCode: LanguageCode): Promise<RecipeDifficultyApiModel[]> {
    const language = await this.languageService.getLanguageOrDefault(languageCode)
    const difficulties = await this.recipeDifficultyRepository.findAllRecipeDifficulties(language)
    const mappedDifficulties = difficulties.map(({ translations, ...difficulty }) => {
      const [{ label }] = translations

      return {
        ...difficulty,
        label,
      }
    })

    return RecipeDifficultyApiModel.fromList(mappedDifficulties)
  }
}
