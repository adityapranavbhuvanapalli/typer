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

export const getCachedTopWpmUsers = async (limit = 25, skip = 0) => {
  const getCached = unstable_cache(
    async () => {
      return await prisma.user.findMany({
        orderBy: { topWpm: 'desc' },
        take: limit,
        skip
      })
    },
    ['top-wpm-users', String(limit), String(skip)],
    { revalidate: 60 }
  )
  return getCached()
}

export const getCachedMostCompletedUsers = async (limit = 25, skip = 0) => {
  const getCached = unstable_cache(
    async () => {
      return await prisma.user.findMany({
        orderBy: { totalCompleted: 'desc' },
        take: limit,
        skip
      })
    },
    ['most-completed-users', String(limit), String(skip)],
    { revalidate: 60 }
  )
  return getCached()
}

export const getCachedLongestStreakUsers = async (limit = 25, skip = 0) => {
  const getCached = unstable_cache(
    async () => {
      return await prisma.user.findMany({
        orderBy: { longestStreak: 'desc' },
        take: limit,
        skip
      })
    },
    ['longest-streak-users', String(limit), String(skip)],
    { revalidate: 60 }
  )
  return getCached()
}
