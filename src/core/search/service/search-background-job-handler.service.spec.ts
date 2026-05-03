import { describe, expect, it, jest } from '@jest/globals'
import { BackgroundJobType } from '@prisma/client'
import { NonRetryableBackgroundJobError } from '@core/background-job'
import { SearchBackgroundJobHandlerService } from './search-background-job-handler.service'

describe('SearchBackgroundJobHandlerService', () => {
  const searchService: any = {
    handleSearchSyncProductJob: jest.fn(),
    handleSearchSyncRecipeJob: jest.fn(),
    handleSearchReindexProductsJob: jest.fn(),
    handleSearchReindexRecipesJob: jest.fn(),
  }

  const service = new SearchBackgroundJobHandlerService(searchService)

  it('should expose supported job types', () => {
    expect(service.supportedTypes).toEqual([
      BackgroundJobType.SEARCH_SYNC_PRODUCT,
      BackgroundJobType.SEARCH_SYNC_RECIPE,
      BackgroundJobType.SEARCH_REINDEX_PRODUCTS,
      BackgroundJobType.SEARCH_REINDEX_RECIPES,
    ])
  })

  it('should delegate sync and reindex jobs to search service', async () => {
    searchService.handleSearchSyncProductJob.mockResolvedValue({ ok: true })
    searchService.handleSearchSyncRecipeJob.mockResolvedValue({ ok: true })
    searchService.handleSearchReindexProductsJob.mockResolvedValue({ ok: true })
    searchService.handleSearchReindexRecipesJob.mockResolvedValue({ ok: true })

    await service.handle({ type: BackgroundJobType.SEARCH_SYNC_PRODUCT } as never)
    await service.handle({ type: BackgroundJobType.SEARCH_SYNC_RECIPE } as never)
    await service.handle({ type: BackgroundJobType.SEARCH_REINDEX_PRODUCTS } as never)
    await service.handle({ type: BackgroundJobType.SEARCH_REINDEX_RECIPES } as never)

    expect(searchService.handleSearchSyncProductJob).toHaveBeenCalled()
    expect(searchService.handleSearchSyncRecipeJob).toHaveBeenCalled()
    expect(searchService.handleSearchReindexProductsJob).toHaveBeenCalled()
    expect(searchService.handleSearchReindexRecipesJob).toHaveBeenCalled()
  })

  it('should throw for unsupported type', async () => {
    await expect(service.handle({ type: 'UNKNOWN' } as never)).rejects.toBeInstanceOf(NonRetryableBackgroundJobError)
  })
})
