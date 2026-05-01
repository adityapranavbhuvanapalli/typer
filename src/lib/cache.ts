import { unstable_cache } from 'next/cache'
import prisma from './db'

export const getCachedDailyChallenge = unstable_cache(
  async () => {
    return await prisma.challenge.findFirst({
      where: { isDaily: true }
    })
  },
  ['daily-challenge'],
  { revalidate: 60 } // Revalidate every 60 seconds
)

export const getCachedTopUsers = unstable_cache(
  async (limit = 5) => {
    return await prisma.user.findMany({
      where: { totalCompleted: { gt: 0 } },
      orderBy: { topWpm: 'desc' },
      take: limit
    })
  },
  ['top-users'],
  { revalidate: 60 }
)

export const getCachedTopWpmUsers = unstable_cache(
  async (limit = 25) => {
    return await prisma.user.findMany({
      orderBy: { topWpm: 'desc' },
      take: limit
    })
  },
  ['top-wpm-users'],
  { revalidate: 60 }
)

export const getCachedMostCompletedUsers = unstable_cache(
  async (limit = 25) => {
    return await prisma.user.findMany({
      orderBy: { totalCompleted: 'desc' },
      take: limit
    })
  },
  ['most-completed-users'],
  { revalidate: 60 }
)

export const getCachedLongestStreakUsers = unstable_cache(
  async (limit = 25) => {
    return await prisma.user.findMany({
      orderBy: { longestStreak: 'desc' },
      take: limit
    })
  },
  ['longest-streak-users'],
  { revalidate: 60 }
)
