import { PrismaClient } from '@prisma/client'
import { updateChallengeDifficulty, calculateUserRating } from '../src/lib/rating'

const prisma = new PrismaClient()

async function backfill() {
  console.log('🚀 Starting Rating Backfill...')

  // 1. Update all Challenge Difficulty Coefficients
  console.log('--- Recalculating Challenge Difficulties ---')
  const challenges = await prisma.challenge.findMany({ select: { id: true, title: true } })
  for (const challenge of challenges) {
    const coeff = await updateChallengeDifficulty(challenge.id)
    console.log(`Updated [${challenge.title}]: Coefficient = ${coeff.toFixed(2)}`)
  }

  // 2. Calculate and Update User Ratings
  console.log('\n--- Calculating User Ratings ---')
  const users = await prisma.user.findMany({
    where: { totalCompleted: { gt: 0 } },
    select: { id: true, username: true }
  })

  for (const user of users) {
    const rating = await calculateUserRating(user.id)
    await prisma.user.update({
      where: { id: user.id },
      data: { rating }
    })
    console.log(`Updated User [${user.username}]: Rating = ${Math.round(rating)} TR`)
  }

  console.log('\n✅ Backfill Complete!')
}

backfill()
  .catch(e => {
    console.error('❌ Backfill Failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
