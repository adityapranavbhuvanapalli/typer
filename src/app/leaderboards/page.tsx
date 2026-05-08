import prisma from '@/lib/db'
import LeaderboardTable from './LeaderboardTable'
import { getCachedTopWpmUsers, getCachedMostCompletedUsers, getCachedLongestStreakUsers } from '@/lib/cache'

// Next.js config to revalidate periodically or keep dynamic
export const revalidate = 60 // regenerate page every 60 seconds

export default async function LeaderboardsPage(props: { searchParams: Promise<{ page?: string }> }) {
  const params = await props.searchParams
  const page = parseInt(params.page || '1') || 1
  const pageSize = 5
  const skip = (page - 1) * pageSize

  const [topWpm, avgWpm, mostCompleted, longestStreak, totalCount] = await Promise.all([
    getCachedTopWpmUsers(pageSize, skip),
    prisma.user.findMany({ orderBy: { averageWpm: 'desc' }, take: pageSize, skip }),
    getCachedMostCompletedUsers(pageSize, skip),
    getCachedLongestStreakUsers(pageSize, skip),
    prisma.user.count({ where: { totalCompleted: { gt: 0 } } })
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Serialize to avoid passing Date objects to Client Component
  const serialize = (users: any[]) => users.map(u => ({
    id: u.id,
    name: (u.firstName || u.lastName) ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : null,
    image: u.image,
    topWpm: u.topWpm,
    averageWpm: u.averageWpm,
    totalCompleted: u.totalCompleted,
    currentStreak: u.currentStreak,
    longestStreak: u.longestStreak,
  }))

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-black text-[var(--text-strong)] mb-4 text-center">Global Leaderboards</h1>
      <p className="text-center text-[var(--text-muted)] mb-16 max-w-2xl mx-auto">
        Compete with the fastest typists online. Rankings are updated in real-time as users complete challenges.
      </p>

      {/* Main Tabbed Leaderboard Component */}
      <LeaderboardTable 
        topWpmUsers={serialize(topWpm)}
        avgWpmUsers={serialize(avgWpm)} 
        mostCompletedUsers={serialize(mostCompleted)} 
        longestStreakUsers={serialize(longestStreak)} 
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
      />
    </div>
  )
}
