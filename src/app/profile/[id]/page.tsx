import prisma from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import UserGraphs from './UserGraphs'
import { auth } from '@/auth'
import { ProfileSidebar, StatsDashboard } from './ProfileComponents'

export default async function ProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await auth()
  
  const [user, totalUsersWithCompleted] = await Promise.all([
    prisma.user.findFirst({
      where: {
        OR: [
          { id: params.id },
          { username: params.id }
        ]
      }
    }),
    prisma.user.count({ where: { totalCompleted: { gt: 0 } } })
  ])

  if (!user) notFound()

  // Canonical redirect
  if (params.id === user.id && user.username) {
    redirect(`/profile/${user.username}`)
  }

  // Fetch specialized data in parallel for performance
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const [
    topWpmSlower, 
    avgWpmSlower, 
    totalUsers,
    activityDataRaw,
    progressionDataRaw,
    recentAttemptsRaw
  ] = await Promise.all([
    prisma.user.count({ where: { totalCompleted: { gt: 0 }, topWpm: { lt: user.topWpm } } }),
    prisma.user.count({ where: { totalCompleted: { gt: 0 }, averageWpm: { lt: user.averageWpm } } }),
    prisma.user.count({ where: { totalCompleted: { gt: 0 } } }),
    // 1. Activity Data (Past Year ONLY - Lightweight)
    prisma.attempt.findMany({
      where: { userId: user.id, completedAt: { gte: oneYearAgo } },
      select: { completedAt: true }
    }),
    // 2. Progression Data (Last 500 attempts for trend - Lightweight)
    prisma.attempt.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      take: 500,
      select: { wpm: true, accuracy: true, completedAt: true }
    }),
    // 3. Recent History (Last 10 - Full objects)
    prisma.attempt.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: { challenge: true }
    })
  ])

  const topWpmRank = totalUsers - topWpmSlower
  const avgWpmRank = totalUsers - avgWpmSlower
  const percentile = totalUsers === 0 ? 0 : ((totalUsers - topWpmRank + 1) / totalUsers) * 100

  // Serialize datasets
  const activityData = activityDataRaw.map(a => ({ completedAt: a.completedAt.toISOString() }))
  const progressionData = progressionDataRaw.map(a => ({ 
    wpm: a.wpm, 
    accuracy: a.accuracy, 
    completedAt: a.completedAt.toISOString() 
  }))
  const recentAttempts = recentAttemptsRaw.map(a => ({
    ...a,
    completedAt: a.completedAt.toISOString(),
  }))

  // Solved Breakdown Data
  const solvedByDifficulty: Record<string, number> = {}
  const seenChallenges = new Set()
  
  // We use recentAttempts + activityData for breakdown to avoid another heavy query
  // Actually, let's just fetch the counts by difficulty directly for accuracy
  const [difficultyCounts, userSolvedCounts] = await Promise.all([
    prisma.challenge.groupBy({
      by: ['difficulty'],
      _count: true
    }),
    prisma.attempt.groupBy({
      by: ['challengeId'],
      where: { userId: user.id },
      _count: true
    })
  ])

  // Get difficulty mapping for solved challenges
  const solvedChallenges = await prisma.challenge.findMany({
    where: { id: { in: userSolvedCounts.map(c => c.challengeId) } },
    select: { id: true, difficulty: true }
  })

  solvedChallenges.forEach(c => {
    solvedByDifficulty[c.difficulty] = (solvedByDifficulty[c.difficulty] || 0) + 1
  })

  const totalByDifficulty: Record<string, number> = {}
  difficultyCounts.forEach(c => {
    totalByDifficulty[c.difficulty] = c._count
  })

  // Serialize user
  const serializedUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    bio: user.bio,
    location: user.location,
    website: user.website,
    linkedin: user.linkedin,
    github: user.github,
    image: user.image
  }

  const isOwnProfile = session?.user?.id === user.id

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <ProfileSidebar 
              user={user} 
              serializedUser={serializedUser} 
              isOwnProfile={isOwnProfile} 
              topRank={topWpmRank} 
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            <StatsDashboard 
              user={user} 
              percentile={percentile} 
              totalUsers={totalUsers}
              avgRank={avgWpmRank}
              solvedByDifficulty={solvedByDifficulty}
              totalByDifficulty={totalByDifficulty}
            />

            {/* User Graphs (Progression & Activity) */}
            <UserGraphs 
              activityData={activityData} 
              progressionData={progressionData} 
              totalCompleted={user.totalCompleted} 
            />

            {/* Challenge History Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[var(--text-strong)] flex items-center gap-3">
                <span className="w-2 h-6 bg-[var(--primary)] rounded-full"></span>
                Challenge History
              </h2>
              {recentAttempts.length > 0 ? (
                <div className="space-y-3">
                  {recentAttempts.map((attempt: any) => (
                    <div key={attempt.id} className="bg-[var(--panel-bg)] border border-[var(--panel-border)] p-4 px-6 rounded-2xl flex items-center justify-between hover:border-[var(--primary)]/30 transition-all group cursor-default">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-[var(--text-strong)] truncate group-hover:text-[var(--primary)] transition-colors">{attempt.challenge.title}</p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            attempt.challenge.difficulty === 'EASY' ? 'text-[var(--diff-easy)] border-[var(--diff-easy)]/30 bg-[var(--diff-easy)]/10' :
                            attempt.challenge.difficulty === 'MEDIUM' ? 'text-[var(--diff-med)] border-[var(--diff-med)]/30 bg-[var(--diff-med)]/10' :
                            attempt.challenge.difficulty === 'HARD' ? 'text-[var(--diff-hard)] border-[var(--diff-hard)]/30 bg-[var(--diff-hard)]/10' :
                            'text-[var(--diff-super)] border-[var(--diff-super)]/30 bg-[var(--diff-super)]/10'
                          }`}>
                            {attempt.challenge.difficulty.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] font-medium">
                          {(() => {
                            const date = new Date(attempt.completedAt);
                            const h = date.getUTCHours();
                            const m = date.getUTCMinutes();
                            const ampm = h >= 12 ? 'PM' : 'AM';
                            const displayH = h % 12 || 12;
                            const displayM = m < 10 ? `0${m}` : m;
                            return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()} ${displayH}:${displayM} ${ampm} UTC`;
                          })()}
                        </p>
                      </div>
                      <div className="flex items-center gap-8">
                         <div className="text-right">
                          <p className="text-[10px] text-[var(--metric-speed)] font-black uppercase tracking-tighter">Speed</p>
                          <p className="text-lg font-mono font-black text-[var(--text-strong)]">{Math.round(attempt.wpm)} <span className="text-[10px] font-normal text-[var(--text-muted)]">WPM</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-[var(--success)] font-black uppercase tracking-tighter">Accuracy</p>
                          <p className="text-lg font-mono font-black text-[var(--text-strong)]">{Math.round(attempt.accuracy)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] border-dashed p-12 rounded-3xl text-center">
                  <p className="text-[var(--text-muted)] font-medium">No challenges completed yet. Start typing to see your history!</p>
                </div>
              )}

              {recentAttempts.length > 0 && (
                <div className="pt-4 flex justify-center">
                  <Link 
                    href={`/profile/${user.username || user.id}/history`}
                    className="px-8 py-3 bg-[var(--panel-border)]/50 hover:bg-[var(--panel-border)] text-[var(--text-strong)] font-black rounded-2xl border border-[var(--panel-border)] transition-all flex items-center gap-2 group"
                  >
                    View All History
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
