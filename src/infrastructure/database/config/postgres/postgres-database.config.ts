import { Provider } from '@nestjs/common'
import { ConfigType, getConfigToken, registerAs } from '@nestjs/config'
import { Pool } from 'pg'
import { POSTGRES_DATABASE_CONFIG_KEY, POSTGRES_DATABASE_CONFIG_TOKEN, POSTGRES_POOL_TOKEN } from './constant'
import { PostgresDatabaseEnvConfig } from './type'

export const postgresDatabaseEnvConfig: () => PostgresDatabaseEnvConfig = registerAs(
  POSTGRES_DATABASE_CONFIG_KEY,
  () => ({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    databaseName: process.env.POSTGRES_DB_NAME,
    databaseUrl: process.env.DATABASE_URL,
  }),
)

function getPostgresDatabaseConfigFactory(
  config: ConfigType<typeof postgresDatabaseEnvConfig>,
): PostgresDatabaseEnvConfig {
  return config
}

function getPostgresDatabasePoolFactory(config: ConfigType<typeof postgresDatabaseEnvConfig>): Pool {
  return new Pool({
    connectionString: config.databaseUrl,
  })
}

export const postgresDatabaseProviders: Provider[] = [
  {
    provide: POSTGRES_DATABASE_CONFIG_TOKEN,
    useFactory: getPostgresDatabaseConfigFactory,
    inject: [getConfigToken(POSTGRES_DATABASE_CONFIG_KEY)],
  },
  {
    provide: POSTGRES_POOL_TOKEN,
    useFactory: getPostgresDatabasePoolFactory,
    inject: [POSTGRES_DATABASE_CONFIG_TOKEN],
  },
]
