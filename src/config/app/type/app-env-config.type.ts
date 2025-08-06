import { LogLevel } from '@nestjs/common'
import { Environment } from '@common/enum'

export type AppEnvConfig = {
  port: string
  host: string
  allowedOrigins: string[]
  logLevels: LogLevel[]
  nodeEnv: Environment
}
