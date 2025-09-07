import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { CleanupExpiredEntitiesJob } from './job'

@Module({
  imports: [
    ScheduleModule.forRoot({
      cronJobs: true,
      intervals: false,
      timeouts: false,
    }),
  ],
  providers: [CleanupExpiredEntitiesJob],
})
export class SchedulerModule {}
