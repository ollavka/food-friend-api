import { BackgroundJobStatus, BackgroundJobType } from '@prisma/client'
import { Uuid } from '@common/type'

export type BackgroundJobDetails = {
  id: Uuid
  type: BackgroundJobType
  status: BackgroundJobStatus
  attempts: number
  maxAttempts: number
  runAt: Date
  startedAt?: Date | null
  finishedAt?: Date | null
  result?: unknown
  error?: unknown
  createdAt: Date
  updatedAt: Date
}
