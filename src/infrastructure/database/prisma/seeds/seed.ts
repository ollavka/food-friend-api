import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { seedLanguages } from './languages/seed'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
})

async function main(): Promise<void> {
  await Promise.all([seedLanguages(prisma)])
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
