import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const words = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
]

const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', '[', ']', '{', '}', '|', ';', ':', ',', '.', '/', '<', '>', '?']

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)]
}

function generateEasy(wordCount = 30) {
  // strictly lower case, no punctuation
  const sentence = Array.from({ length: wordCount }, () => getRandomWord()).join(' ')
  return sentence
}

function generateMedium(wordCount = 40) {
  // All cases, regular punctuation (comma, fullstop)
  let sentence = []
  for (let i = 0; i < wordCount; i++) {
    let word = getRandomWord()
    // 20% chance to capitalize
    if (Math.random() > 0.8) word = word.charAt(0).toUpperCase() + word.slice(1)
    // 10% chance to add comma
    if (Math.random() > 0.9 && i < wordCount - 1) word += ','
    sentence.push(word)
  }
  return sentence.join(' ') + '.'
}

function generateHard(wordCount = 40) {
  // random words, all types of special characters
  let sentence = []
  for (let i = 0; i < wordCount; i++) {
    let word = getRandomWord()
    if (Math.random() > 0.5) word = word.charAt(0).toUpperCase() + word.slice(1)
    
    // inject random special char
    if (Math.random() > 0.7) {
      word += specialChars[Math.floor(Math.random() * specialChars.length)]
    }
    sentence.push(word)
  }
  return sentence.join(' ')
}

function generateSuperHard(wordCount = 40) {
  // mix random english words with pure random characters
  let sentence = []
  for (let i = 0; i < wordCount; i++) {
    if (Math.random() > 0.7) {
      // pure random letters
      const randomLen = Math.floor(Math.random() * 5) + 3
      let randomWord = ''
      for(let k=0; k<randomLen; k++) {
        randomWord += String.fromCharCode(97 + Math.floor(Math.random() * 26))
      }
      sentence.push(randomWord)
    } else {
      let word = getRandomWord()
      if (Math.random() > 0.5) word = word.charAt(0).toUpperCase() + word.slice(1)
      if (Math.random() > 0.7) {
        word += specialChars[Math.floor(Math.random() * specialChars.length)]
      }
      sentence.push(word)
    }
  }
  return sentence.join(' ')
}

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
