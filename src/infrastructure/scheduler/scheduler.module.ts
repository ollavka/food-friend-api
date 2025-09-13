import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { CleanupOtpCodesJob, CleanupSessionsJob } from './job'

@Module({
  imports: [
    ScheduleModule.forRoot({
      cronJobs: true,
      intervals: false,
      timeouts: false,
    }),
  ],
  providers: [CleanupOtpCodesJob, CleanupSessionsJob],
})
export class SchedulerModule {}
