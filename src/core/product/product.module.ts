import { Module } from '@nestjs/common'
import { SearchModule } from '@core/search'
import { ProductController } from './controller'
import { ProductRepository } from './repository'
import { ProductBackgroundJobHandlerService, ProductService } from './service'

@Module({
  imports: [SearchModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ProductBackgroundJobHandlerService],
  exports: [ProductService, ProductBackgroundJobHandlerService],
})
export class ProductModule {}
