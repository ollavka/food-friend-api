import { Module } from '@nestjs/common'
import { ProductController } from './controller'
import { ProductRepository } from './repository'
import { ProductService } from './service'

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
})
export class ProductModule {}
