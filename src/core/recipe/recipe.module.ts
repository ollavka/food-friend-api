import { Module } from '@nestjs/common'
import { ProductModule } from '@core/product'
import { RecipeDifficultyModule } from '@core/recipe-difficulty'
import { SearchModule } from '@core/search'
import { UserModule } from '@core/user'
import { RecipeController } from './controller'
import { RecipeRepository } from './repository'
import { RecipeAiService, RecipeBackgroundJobHandlerService, RecipeService } from './service'

@Module({
  imports: [RecipeDifficultyModule, UserModule, ProductModule, SearchModule],
  controllers: [RecipeController],
  providers: [RecipeService, RecipeRepository, RecipeAiService, RecipeBackgroundJobHandlerService],
  exports: [RecipeService, RecipeAiService, RecipeBackgroundJobHandlerService],
})
export class RecipeModule {}
