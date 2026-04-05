import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import {
  generateEasy,
  generateMedium,
  generateHard,
  generateSuperHard
} from '@/lib/challenge-generator'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const totalCount = await prisma.challenge.count()

    const baseSlNo = totalCount + 1

    // Generate contents explicitly so we can safely extract titles out of them
    const eaContent = generateEasy()
    const mdContent = generateMedium()
    const hdContent = generateHard()
    const shContent = generateSuperHard()

    const newChallenges = [
      {
        serialNo: baseSlNo,
        title: `Sl.No: ${baseSlNo} - ${eaContent.split(/\\s+/).slice(0, 4).join(' ')}...`,
        difficulty: 'EASY',
        content: eaContent
      },
      {
        serialNo: baseSlNo + 1,
        title: `Sl.No: ${baseSlNo + 1} - ${mdContent.split(/\\s+/).slice(0, 4).join(' ')}...`,
        difficulty: 'MEDIUM',
        content: mdContent
      },
      {
        serialNo: baseSlNo + 2,
        title: `Sl.No: ${baseSlNo + 2} - ${hdContent.split(/\\s+/).slice(0, 4).join(' ')}...`,
        difficulty: 'HARD',
        content: hdContent
      },
      {
        serialNo: baseSlNo + 3,
        title: `Sl.No: ${baseSlNo + 3} - ${shContent.split(/\\s+/).slice(0, 4).join(' ')}...`,
        difficulty: 'SUPER_HARD',
        content: shContent
      }
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
