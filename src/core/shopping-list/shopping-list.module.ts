import { Module } from '@nestjs/common'
import { ShoppingListController } from './controller'
import { ShoppingListRepository } from './repository'
import { ShoppingListService } from './service'

@Module({
  controllers: [ShoppingListController],
  providers: [ShoppingListService, ShoppingListRepository],
})
export class ShoppingListModule {}
