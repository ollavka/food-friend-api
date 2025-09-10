import { Global, Module } from '@nestjs/common'
import { OtpRepository } from './repository'
import { OtpService } from './service'

@Global()
@Module({
  providers: [OtpService, OtpRepository],
  exports: [OtpService, OtpRepository],
})
export class OtpModule {}
