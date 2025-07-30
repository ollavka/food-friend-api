import { Module } from '@nestjs/common'
import { AuthModule } from '@core/auth'

@Module({
  imports: [AuthModule],
})
export class AppModule {}
