import { PrismaClient } from '@prisma/client'
import {
  generateEasy,
  generateMedium,
  generateHard,
  generateSuperHard
} from '../src/lib/challenge-generator'

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Safely wipe attempts to bypass foreign-key constraints before deleting challenges
  await prisma.attempt.deleteMany()
  await prisma.challenge.deleteMany()

  const difficulties = ['EASY', 'MEDIUM', 'HARD', 'SUPER_HARD']

  for (let globalIndex = 1; globalIndex <= 100; globalIndex++) {
    let diff = difficulties[Math.floor(Math.random() * difficulties.length)]
    let content = ""

    // Force 'EASY' for the first 5 challenges
    if (globalIndex <= 5) {
      diff = 'EASY'
      content = generateEasy(1)
    } else {
      if (diff === 'EASY') content = generateEasy()
      if (diff === 'MEDIUM') content = generateMedium()
      if (diff === 'HARD') content = generateHard()
      if (diff === 'SUPER_HARD') content = generateSuperHard()
    }

    const titleSnippet = content.split(/\s+/).slice(0, 4).join(' ')

    await prisma.challenge.create({
      data: {
        serialNo: globalIndex,
        title: `${globalIndex}. ${titleSnippet}...`,
        difficulty: diff,
        content: content,
      }
    })
  }

  // Set a random challenge as the daily for today
  const allChallenges = await prisma.challenge.findMany()
  if (allChallenges.length > 0) {
    const randomChallenge = allChallenges[Math.floor(Math.random() * allChallenges.length)]
    const todayStr = new Date().toISOString().split('T')[0]
    await prisma.challenge.update({
      where: { id: randomChallenge.id },
      data: { isDaily: true, dailyDate: new Date(`${todayStr}T00:00:00.000Z`) }
    })
  }

  console.log("Seeding completed: 100 Challenges Generated.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
