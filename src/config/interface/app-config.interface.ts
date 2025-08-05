import { LogLevel } from '@nestjs/common'
import { Environment } from '@/common/enum'

export interface AppConfig {
  port: string
  host: string
  allowedOrigins: string[]
  logLevels: LogLevel[]
  nodeEnv: Environment
}
