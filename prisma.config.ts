import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { expand } from 'dotenv-expand'
import { defineConfig } from 'prisma/config'

const env = loadEnv({ path: '.env' })
expand(env)

const baseDir = path.join('src', 'infrastructure', 'database', 'prisma')

export default defineConfig({
  schema: path.join(baseDir, 'schema'),
  migrations: {
    path: path.join(baseDir, 'migrations'),
  },
  views: {
    path: path.join(baseDir, 'views'),
  },
  typedSql: {
    path: path.join(baseDir, 'queries'),
  },
})
