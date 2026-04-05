import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const words = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me"]
const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', '[', ']', '{', '}', '|', ';', ':', ',', '.', '/', '<', '>', '?']

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)]
}

function generateEasy() {
  return Array.from({ length: 30 }, () => getRandomWord()).join(' ')
}

function generateMedium() {
  let sentence = []
  for (let i = 0; i < 40; i++) {
    let word = getRandomWord()
    if (Math.random() > 0.8) word = word.charAt(0).toUpperCase() + word.slice(1)
    if (Math.random() > 0.9 && i < 39) word += ','
    sentence.push(word)
  }
  return sentence.join(' ') + '.'
}

function generateHard() {
  let sentence = []
  for (let i = 0; i < 40; i++) {
    let word = getRandomWord()
    if (Math.random() > 0.5) word = word.charAt(0).toUpperCase() + word.slice(1)
    if (Math.random() > 0.7) {
      word += specialChars[Math.floor(Math.random() * specialChars.length)]
    }
    sentence.push(word)
  }
  return sentence.join(' ')
}

function generateSuperHard() {
  let sentence = []
  for (let i = 0; i < 40; i++) {
    if (Math.random() > 0.7) {
      const randomLen = Math.floor(Math.random() * 5) + 3
      let randomWord = ''
      for(let k=0; k<randomLen; k++) randomWord += String.fromCharCode(97 + Math.floor(Math.random() * 26))
      sentence.push(randomWord)
    } else {
      let word = getRandomWord()
      if (Math.random() > 0.5) word = word.charAt(0).toUpperCase() + word.slice(1)
      if (Math.random() > 0.7) word += specialChars[Math.floor(Math.random() * specialChars.length)]
      sentence.push(word)
    }
  }
  return sentence.join(' ')
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const totalCount = await prisma.challenge.count()
    
    let baseSlNo = totalCount + 1
    
    // Generate contents explicitly so we can safely extract titles out of them
    const eaContent = generateEasy()
    const mdContent = generateMedium()
    const hdContent = generateHard()
    const shContent = generateSuperHard()

    const newChallenges = [
      { serialNo: baseSlNo, title: `Sl.No: ${baseSlNo} - ${eaContent.split(/\\s+/).slice(0, 4).join(' ')}...`, difficulty: 'EASY', content: eaContent },
      { serialNo: baseSlNo + 1, title: `Sl.No: ${baseSlNo + 1} - ${mdContent.split(/\\s+/).slice(0, 4).join(' ')}...`, difficulty: 'MEDIUM', content: mdContent },
      { serialNo: baseSlNo + 2, title: `Sl.No: ${baseSlNo + 2} - ${hdContent.split(/\\s+/).slice(0, 4).join(' ')}...`, difficulty: 'HARD', content: hdContent },
      { serialNo: baseSlNo + 3, title: `Sl.No: ${baseSlNo + 3} - ${shContent.split(/\\s+/).slice(0, 4).join(' ')}...`, difficulty: 'SUPER_HARD', content: shContent }
    ]

    await prisma.challenge.createMany({
      data: newChallenges
    })
    
    return NextResponse.json({ success: true, message: 'Weekend challenges generated' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
