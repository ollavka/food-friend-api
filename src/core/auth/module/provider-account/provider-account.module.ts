import { Module } from '@nestjs/common'
import { ProviderAccountRepository } from './repository'
import { ProviderAccountService } from './service'

@Module({
  providers: [ProviderAccountService, ProviderAccountRepository],
  exports: [ProviderAccountService],
})
export class ProviderAccountModule {}
