import { LogLevel } from '@nestjs/common'
import { registerAs } from '@nestjs/config'
import { Environment } from '@common/enum'
import { APP_ENV_CONFIG_KEY } from './constant'
import { AppEnvConfig } from './type'

export const appEnvConfig: () => AppEnvConfig = registerAs(APP_ENV_CONFIG_KEY, () => ({
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
