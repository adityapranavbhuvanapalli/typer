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
  async () => {
    return await prisma.user.findMany({
      where: { totalCompleted: { gt: 0 } },
      orderBy: { topWpm: 'desc' },
      take: 5
    })
  },
  ['top-users'],
  { revalidate: 60 } // Revalidate every 60 seconds
)
