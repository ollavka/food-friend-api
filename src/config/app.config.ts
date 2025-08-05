import { LogLevel } from '@nestjs/common'
import { registerAs } from '@nestjs/config'
import { Environment } from '@/common/enum'
import { AppConfig } from './interface'

export const appConfig: () => AppConfig = registerAs('app', () => ({
  port: process.env.APP_PORT,
  host: process.env.APP_HOST,
  nodeEnv: process.env.NODE_ENV as Environment,
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(',').map((origin) => origin.trim()),
  logLevels: <LogLevel[]>[
    ...('true' === process.env.LOG_ERROR ? ['error'] : []),
    ...('true' === process.env.LOG_WARNING ? ['warn'] : []),
    ...('true' === process.env.LOG_INFO ? ['log'] : []),
    ...('true' === process.env.LOG_DEBUG ? ['debug'] : []),
    ...('true' === process.env.LOG_VERBOSE ? ['verbose'] : []),
  ],
}))
