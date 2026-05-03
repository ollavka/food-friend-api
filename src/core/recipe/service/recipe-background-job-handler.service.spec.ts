import { describe, expect, it, jest } from '@jest/globals'
import { BackgroundJobType } from '@prisma/client'
import { NonRetryableBackgroundJobError } from '@core/background-job'
import { RecipeBackgroundJobHandlerService } from './recipe-background-job-handler.service'

describe('RecipeBackgroundJobHandlerService', () => {
  const recipeAiService: any = {
    handleRecipeTranslationJob: jest.fn(),
    handleRecipeImageAnalysisJob: jest.fn(),
    handleRecipeImageGenerationJob: jest.fn(),
  }

  const service = new RecipeBackgroundJobHandlerService(recipeAiService)

  it('should expose supported types', () => {
    expect(service.supportedTypes).toEqual([
      BackgroundJobType.RECIPE_TRANSLATION,
      BackgroundJobType.RECIPE_IMAGE_ANALYSIS,
      BackgroundJobType.RECIPE_IMAGE_GENERATION,
    ])
  })

  it('should delegate handling by type', async () => {
    recipeAiService.handleRecipeTranslationJob.mockResolvedValue({ ok: true })
    recipeAiService.handleRecipeImageAnalysisJob.mockResolvedValue({ ok: true })
    recipeAiService.handleRecipeImageGenerationJob.mockResolvedValue({ ok: true })

    await service.handle({ type: BackgroundJobType.RECIPE_TRANSLATION } as never)
    await service.handle({ type: BackgroundJobType.RECIPE_IMAGE_ANALYSIS } as never)
    await service.handle({ type: BackgroundJobType.RECIPE_IMAGE_GENERATION } as never)

    expect(recipeAiService.handleRecipeTranslationJob).toHaveBeenCalled()
    expect(recipeAiService.handleRecipeImageAnalysisJob).toHaveBeenCalled()
    expect(recipeAiService.handleRecipeImageGenerationJob).toHaveBeenCalled()
  })

  it('should throw for unsupported type', async () => {
    await expect(service.handle({ type: 'UNKNOWN' } as never)).rejects.toBeInstanceOf(NonRetryableBackgroundJobError)
  })
})
