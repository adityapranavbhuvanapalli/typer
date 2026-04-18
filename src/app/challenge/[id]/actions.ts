"use server"

import prisma from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { getEffectiveStreak } from '@/lib/streak'

export async function submitAttempt(challengeId: string, stats: { wpm: number, accuracy: number, timeSeconds: number, errors: number }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Not authenticated: Missing User ID in session. Please sign out and sign back in.' }
    }

    const userId = session.user.id

    // Record the attempt
    await prisma.attempt.create({
      data: {
        userId,
        challengeId,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        timeSeconds: stats.timeSeconds,
      }
    })

    // Update user aggregates (total Completed, average WPM, top WPM)
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { attempts: true } })
    if (!user) return { error: 'User not found in database' }

    // Recalculate WPMs (We could also just query the Db)
    const allWpms = user.attempts.map(a => a.wpm)
    const topWpm = Math.max(...allWpms)
    const averageWpm = allWpms.reduce((a, b) => a + b, 0) / allWpms.length
    
    // Calculate Streaks if the challenge is Daily
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
    
    let newCurrentStreak = user.currentStreak
    let newLongestStreak = user.longestStreak
    let newLastDailyDate = user.lastDailyDate

    if (challenge?.isDaily) {
      const todayStr = new Date().toISOString().split('T')[0]
      
      // Check if they already did a daily today to avoid double counting
      const lastDailyStr = user.lastDailyDate ? new Date(user.lastDailyDate).toISOString().split('T')[0] : null
      
      if (lastDailyStr !== todayStr) {
        // Use the utility to get the base streak (either current or 0 if expired)
        const baseStreak = getEffectiveStreak({
          currentStreak: user.currentStreak,
          lastDailyDate: user.lastDailyDate
        })
        
        newCurrentStreak = baseStreak + 1
        newLastDailyDate = new Date(todayStr + "T00:00:00.000Z")
        
        if (newCurrentStreak > newLongestStreak) {
          newLongestStreak = newCurrentStreak
        }
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalCompleted: user.attempts.length,
        averageWpm,
        topWpm,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastDailyDate: newLastDailyDate
      }
    })

    // Aggressively flush the Next.js router cache to ensure Leaders and Streaks instantly reflect the new data!
    revalidatePath('/', 'layout')

    return { success: true }
  } catch (e: any) {
    console.error("Action Error:", e)
    return { error: e.message || 'Unknown server error' }
  }
}
