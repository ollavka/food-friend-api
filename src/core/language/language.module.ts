import { Global, Module } from '@nestjs/common'
import { LanguageController } from './controller'
import { LanguageRepository } from './repository'
import { LanguageService } from './service'

@Global()
@Module({
  controllers: [LanguageController],
  providers: [LanguageService, LanguageRepository],
  exports: [LanguageService],
})
export class LanguageModule {}
