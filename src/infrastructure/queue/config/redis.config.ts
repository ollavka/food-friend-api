import { registerAs } from '@nestjs/config'
import { REDIS_ENV_CONFIG_KEY } from './constant'
import { RedisEnvConfig } from './type'

export const redisEnvConfig: () => RedisEnvConfig = registerAs(REDIS_ENV_CONFIG_KEY, () => ({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : undefined,
}))
