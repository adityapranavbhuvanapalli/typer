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
  
  let globalIndex = 1
  
  for (const diff of difficulties) {
    for (let i = 1; i <= 25; i++) {
      let content = ""
      if (globalIndex <= 5) {
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
      globalIndex++
    }
  }

  // Set the very first easy challenge as the daily for today
  const firstChallenge = await prisma.challenge.findFirst({ where: { difficulty: 'EASY' } })
  if (firstChallenge) {
    const todayStr = new Date().toISOString().split('T')[0]
    await prisma.challenge.update({
      where: { id: firstChallenge.id },
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
