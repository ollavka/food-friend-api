import { Global, Module } from '@nestjs/common'
import { BcryptService } from './service'

@Global()
@Module({
  providers: [BcryptService],
  exports: [BcryptService],
})
export class BcryptModule {}
