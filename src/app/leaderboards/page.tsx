import { PrismaClient } from '@prisma/client'
import LeaderboardTable from './LeaderboardTable'

const prisma = new PrismaClient()

// Next.js config to revalidate periodically or keep dynamic
export const revalidate = 60 // regenerate page every 60 seconds

export default async function LeaderboardsPage() {
  const [topWpm, avgWpm, mostCompleted, longestStreak] = await Promise.all([
    prisma.user.findMany({ orderBy: { topWpm: 'desc' }, take: 25 }),
    prisma.user.findMany({ orderBy: { averageWpm: 'desc' }, take: 25 }),
    prisma.user.findMany({ orderBy: { totalCompleted: 'desc' }, take: 25 }),
    prisma.user.findMany({ orderBy: { longestStreak: 'desc' }, take: 25 })
  ])

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-black text-[var(--text-strong)] mb-4 text-center">Global Leaderboards</h1>
      <p className="text-center text-[var(--text-muted)] mb-16 max-w-2xl mx-auto">
        Compete with the fastest typists online. Rankings are updated in real-time as users complete challenges.
      </p>

      {/* Main Tabbed Leaderboard Component */}
      <LeaderboardTable 
        topWpmUsers={topWpm}
        avgWpmUsers={avgWpm} 
        mostCompletedUsers={mostCompleted} 
        longestStreakUsers={longestStreak} 
      />
    </div>
  )
}
