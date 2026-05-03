import { BackgroundJob, BackgroundJobType } from '@prisma/client'

export type BackgroundJobHandler = {
  supportedTypes: BackgroundJobType[]
  handle(backgroundJob: BackgroundJob): Promise<Record<string, unknown>>
}
