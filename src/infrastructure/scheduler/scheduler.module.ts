import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { CleanupExpiredTokensJob } from './job'

@Module({
  imports: [
    ScheduleModule.forRoot({
      cronJobs: true,
      intervals: false,
      timeouts: false,
    }),
  ],
  providers: [CleanupExpiredTokensJob],
})
export class SchedulerModule {}
