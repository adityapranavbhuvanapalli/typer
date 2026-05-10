"use server"

import prisma from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { updateChallengeDifficulty, calculateSingleAttemptPower, calculateUserRating } from '@/lib/rating'
import { getEffectiveStreak } from '@/lib/streak'

export async function submitAttempt(
  challengeId: string, 
  stats: { 
    wpm: number, 
    timeSeconds: number, 
    errors: number,
    rawLog: any[],
    trueAccuracy: number
  }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Not authenticated: Missing User ID in session. Please sign out and sign back in.' }
    }

    const userId = session.user.id

    // 1. Fetch current challenge and user stats
    const [challenge, user] = await Promise.all([
      prisma.challenge.findUnique({ where: { id: challengeId } }),
      prisma.user.findUnique({ where: { id: userId }, include: { attempts: true } })
    ])

    if (!challenge || !user) return { error: 'Challenge or User not found' }

    const oldRating = user.rating

    // 2. Record the attempt with high-fidelity analytics
    const newAttempt = await prisma.attempt.create({
      data: {
        userId,
        challengeId,
        wpm: stats.wpm,
        accuracy: stats.trueAccuracy, // Required legacy field
        trueAccuracy: stats.trueAccuracy,
        timeSeconds: stats.timeSeconds,
        rawLog: stats.rawLog as any
      }
    })

    // 3. Update Challenge Difficulty (Legacy placeholder)
    updateChallengeDifficulty(challengeId).catch(console.error)

    // 4. Calculate this attempt's Power Score (MVAR-15 Component)
    const powerScore = await calculateSingleAttemptPower(challengeId, stats.wpm, stats.trueAccuracy)

    // 5. Save the power score contribution IMMEDIATELY
    // This allows calculateUserRating to use the cached value
    await prisma.attempt.update({
      where: { id: newAttempt.id },
      data: { ratingChange: powerScore }
    })

    // 6. Update User's Global Rating (The Titan Engine) using cached scores
    const newRating = await calculateUserRating(userId)
    const ratingChange = newRating - oldRating

    await prisma.user.update({
      where: { id: userId },
      data: { rating: newRating }
    })

    // Calculate Percentile for THIS challenge
    const [betterThan, totalAttempts] = await Promise.all([
      prisma.attempt.count({
        where: { challengeId, wpm: { lt: stats.wpm } }
      }),
      prisma.attempt.count({
        where: { challengeId }
      })
    ])

    const percentile = totalAttempts > 0 ? (betterThan / totalAttempts) * 100 : 100

    // 6. Update user aggregates including NEW Rating
    if (!user) return { error: 'User not found in database' }

    // Recalculate WPMs (We could also just query the Db)
    const allWpms = user.attempts.map(a => a.wpm)
    const topWpm = Math.max(...allWpms)
    const averageWpm = allWpms.reduce((a, b) => a + b, 0) / allWpms.length
    
    // Calculate Streaks if the challenge is Daily
    
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
        totalCompleted: new Set(user.attempts.map(a => a.challengeId)).size,
        averageWpm,
        topWpm,
        rating: newRating,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastDailyDate: newLastDailyDate,
        lastActive: new Date()
      }
    })

    // Aggressively flush the Next.js router cache to ensure Leaders and Streaks instantly reflect the new data!
    revalidatePath('/leaderboards')
    revalidatePath(`/profile/${userId}`)
    revalidatePath('/challenges')

    return { success: true, percentile, ratingChange, newRating }
  } catch (error) {
    console.error('Submission Error:', error)
    return { error: 'Failed to save progress. Server error.' }
  }
}
