import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const counts = await prisma.challenge.groupBy({
    by: ['difficulty'],
    _count: true,
  })
  console.log(JSON.stringify(counts, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
