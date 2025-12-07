import { Controller, Get } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { LanguageCode } from '@prisma/client'
import { Language } from '@common/decorator'
import { RecipeDifficultyApiModel } from '../api-model'
import { GetRecipeDifficultyListDocs } from '../docs'
import { RecipeDifficultyService } from '../service'

@ApiTags('Recipes')
@ApiExtraModels(RecipeDifficultyApiModel)
@Controller('recipes/difficulty-levels')
export class RecipeDifficultyController {
  public constructor(private readonly recipeDifficultyService: RecipeDifficultyService) {}

  @Get()
  @GetRecipeDifficultyListDocs()
  public async getRecipeDifficultyList(@Language() languageCode: LanguageCode): Promise<RecipeDifficultyApiModel[]> {
    return this.recipeDifficultyService.getAllRecipeDifficulties(languageCode)
  }
}
