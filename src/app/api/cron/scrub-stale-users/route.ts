import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: Request) {
  // Validate the request is coming from Vercel Cron
  // You must set CRON_SECRET in your Vercel Environment Variables
  const authHeader = req.headers.get('authorization')
  
  // Allow manual execution in development if CRON_SECRET isn't set locally yet, 
  // but strictly enforce it in production.
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // 1. Delete users who registered over 30 days ago and never verified their email
    const unverifiedScrub = await prisma.user.deleteMany({
      where: {
        emailVerified: null,
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    })

    // 2. Delete users who have been inactive for over 90 days
    const inactiveScrub = await prisma.user.deleteMany({
      where: {
        lastActive: {
          lt: ninetyDaysAgo
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Scrub completed successfully",
      scrubbed: {
        unverified: unverifiedScrub.count,
        inactive: inactiveScrub.count,
      }
    })

  } catch (error) {
    console.error("Cron Scrub Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
