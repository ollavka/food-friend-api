import { Module } from '@nestjs/common'
import { RecipeDifficultyController } from './controller'
import { RecipeDifficultyRepository } from './repository'
import { RecipeDifficultyService } from './service'

@Module({
  controllers: [RecipeDifficultyController],
  providers: [RecipeDifficultyService, RecipeDifficultyRepository],
  exports: [RecipeDifficultyService],
})
export class RecipeDifficultyModule {}
