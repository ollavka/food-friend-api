import { Injectable } from '@nestjs/common'
import { BackgroundJob, BackgroundJobType } from '@prisma/client'
import { NonRetryableBackgroundJobError } from '@core/background-job'
import { SearchService } from './search.service'

@Injectable()
export class SearchBackgroundJobHandlerService {
  public readonly supportedTypes = [
    BackgroundJobType.SEARCH_SYNC_PRODUCT,
    BackgroundJobType.SEARCH_SYNC_RECIPE,
    BackgroundJobType.SEARCH_REINDEX_PRODUCTS,
    BackgroundJobType.SEARCH_REINDEX_RECIPES,
  ]

  public constructor(private readonly searchService: SearchService) {}

  public async handle(backgroundJob: BackgroundJob): Promise<Record<string, unknown>> {
    switch (backgroundJob.type) {
      case BackgroundJobType.SEARCH_SYNC_PRODUCT:
        return this.searchService.handleSearchSyncProductJob(backgroundJob)
      case BackgroundJobType.SEARCH_SYNC_RECIPE:
        return this.searchService.handleSearchSyncRecipeJob(backgroundJob)
      case BackgroundJobType.SEARCH_REINDEX_PRODUCTS:
        return this.searchService.handleSearchReindexProductsJob(backgroundJob)
      case BackgroundJobType.SEARCH_REINDEX_RECIPES:
        return this.searchService.handleSearchReindexRecipesJob(backgroundJob)
      default:
        throw new NonRetryableBackgroundJobError('Background job type is not supported by search handler.', {
          type: backgroundJob.type,
        })
    }
  }
}
