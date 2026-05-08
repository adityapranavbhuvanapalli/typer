import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  // Optional security: Ensure it's requested by a verified cron service
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Remove daily status from all existing challenges
    await prisma.challenge.updateMany({
      where: { isDaily: true },
      data: { isDaily: false }
    })
    
    // 2. Fetch all challenges to select a random one
    // In production, we'd want to pick one that hasn't been used recently, but random is fine for this scale
    const challenges = await prisma.challenge.findMany()
    const rawIds = challenges.map(c => c.id)
    
    if (rawIds.length === 0) {
       return NextResponse.json({ error: 'No challenges found to rotate' }, { status: 400 })
    }

    const randomId = rawIds[Math.floor(Math.random() * rawIds.length)]
    
    // 3. Mark the new random challenge as daily
    // Normalize date to UTC Midnight
    const now = new Date()
    const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

    await prisma.challenge.update({
      where: { id: randomId },
      data: { 
        isDaily: true,
        dailyDate: utcMidnight
      }
    })
    
    return NextResponse.json({ success: true, newDailyId: randomId })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
