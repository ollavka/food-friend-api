import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { seedLanguages } from './languages/seed'
import { seedMeasurementBaseTypes } from './measurement-base-type/seed'
import { seedMeasurementUnits } from './measurement-unit/seed'
import { seedProducts } from './product/seed'

// TODO: use it for local seeding
// import { config as loadEnv } from 'dotenv'
// import { expand } from 'dotenv-expand'
// const env = loadEnv({ path: '.env' })
// expand(env)

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
})

async function main(): Promise<void> {
  const languages = await seedLanguages(prisma)
  const measurementBaseTypes = await seedMeasurementBaseTypes(prisma, languages)
  await Promise.all([
    seedMeasurementUnits(prisma, measurementBaseTypes, languages),
    seedProducts(prisma, measurementBaseTypes, languages),
  ])
}

main()
  .then(async () => {
    // eslint-disable-next-line no-console
    console.log('All seeds completed ✅')
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error('Seed failed ❌', e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
