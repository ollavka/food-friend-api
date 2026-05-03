import { Module } from '@nestjs/common'
import { LanguageModule } from '@core/language'
import { SearchController } from './controller'
import { SearchRepository } from './repository'
import { SearchBackgroundJobHandlerService, SearchService } from './service'

@Module({
  imports: [LanguageModule],
  controllers: [SearchController],
  providers: [SearchService, SearchRepository, SearchBackgroundJobHandlerService],
  exports: [SearchService, SearchBackgroundJobHandlerService],
})
export class SearchModule {}
