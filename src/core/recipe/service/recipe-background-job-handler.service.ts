import { Injectable } from '@nestjs/common'
import { BackgroundJob, BackgroundJobType } from '@prisma/client'
import { NonRetryableBackgroundJobError } from '@core/background-job'
import { RecipeAiService } from './recipe-ai.service'

@Injectable()
export class RecipeBackgroundJobHandlerService {
  public readonly supportedTypes = [
    BackgroundJobType.RECIPE_TRANSLATION,
    BackgroundJobType.RECIPE_IMAGE_ANALYSIS,
    BackgroundJobType.RECIPE_IMAGE_GENERATION,
  ]

  public constructor(private readonly recipeAiService: RecipeAiService) {}

  public async handle(backgroundJob: BackgroundJob): Promise<Record<string, unknown>> {
    switch (backgroundJob.type) {
      case BackgroundJobType.RECIPE_TRANSLATION:
        return this.recipeAiService.handleRecipeTranslationJob(backgroundJob)
      case BackgroundJobType.RECIPE_IMAGE_ANALYSIS:
        return this.recipeAiService.handleRecipeImageAnalysisJob(backgroundJob)
      case BackgroundJobType.RECIPE_IMAGE_GENERATION:
        return this.recipeAiService.handleRecipeImageGenerationJob(backgroundJob)
      default:
        throw new NonRetryableBackgroundJobError('Background job type is not supported by recipe handler.', {
          type: backgroundJob.type,
        })
    }
  }
}
