import { Module } from '@nestjs/common'
import { ProductBackgroundJobHandlerService, ProductModule } from '@core/product'
import { RecipeBackgroundJobHandlerService, RecipeModule } from '@core/recipe'
import { SearchBackgroundJobHandlerService, SearchModule } from '@core/search'
import { BACKGROUND_JOB_HANDLERS_TOKEN } from './constant'
import { BackgroundJobController } from './controller'
import { BackgroundJobRepository } from './repository'
import { BackgroundJobService } from './service'
import { BackgroundJobHandler } from './type'

@Module({
  imports: [ProductModule, RecipeModule, SearchModule],
  controllers: [BackgroundJobController],
  providers: [
    BackgroundJobService,
    BackgroundJobRepository,
    {
      provide: BACKGROUND_JOB_HANDLERS_TOKEN,
      useFactory: (
        productHandler: ProductBackgroundJobHandlerService,
        recipeHandler: RecipeBackgroundJobHandlerService,
        searchHandler: SearchBackgroundJobHandlerService,
      ): BackgroundJobHandler[] => [productHandler, recipeHandler, searchHandler],
      inject: [
        ProductBackgroundJobHandlerService,
        RecipeBackgroundJobHandlerService,
        SearchBackgroundJobHandlerService,
      ],
    },
  ],
  exports: [BackgroundJobService],
})
export class BackgroundJobModule {}
