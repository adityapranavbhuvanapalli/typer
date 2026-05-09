const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const counts = await prisma.challenge.groupBy({
    by: ['difficulty'],
    _count: true,
  })
  const userSolved = await prisma.attempt.findMany({
    where: { userId: process.argv[2] },
    include: { challenge: true }
  })
  
  // Get unique challenges solved per difficulty
  const solvedByDifficulty = {}
  const seen = new Set()
  userSolved.forEach(a => {
    if (!seen.has(a.challengeId)) {
      solvedByDifficulty[a.challenge.difficulty] = (solvedByDifficulty[a.challenge.difficulty] || 0) + 1
      seen.add(a.challengeId)
    }
  })

  console.log(JSON.stringify({ 
    totalCounts: counts, 
    solvedByDifficulty 
  }, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
