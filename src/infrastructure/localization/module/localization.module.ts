import { Global, Module } from '@nestjs/common'
import { I18nModule } from 'nestjs-i18n'
import { I18nModuleOptions } from '@config/i18n'
import { LocalizationFactory } from '../service'

@Global()
@Module({
  imports: [I18nModule.forRoot(I18nModuleOptions)],
  providers: [LocalizationFactory],
  exports: [LocalizationFactory, I18nModule],
})
export class LocalizationModule {}
