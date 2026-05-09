import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
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
      },
      include: { 
        attempts: {
          orderBy: { completedAt: 'desc' },
          take: 5,
          include: { challenge: true }
        } 
      }
    }),
    prisma.user.count({ where: { totalCompleted: { gt: 0 } } })
  ])

  if (!user) notFound()

  // Ranks (Fastest Query logic)
  const [topWpmSlower, avgWpmSlower, totalUsers] = await Promise.all([
    prisma.user.count({ where: { totalCompleted: { gt: 0 }, topWpm: { lt: user.topWpm } } }),
    prisma.user.count({ where: { totalCompleted: { gt: 0 }, averageWpm: { lt: user.averageWpm } } }),
    prisma.user.count({ where: { totalCompleted: { gt: 0 } } })
  ])

  const topWpmRank = totalUsers - topWpmSlower
  const avgWpmRank = totalUsers - avgWpmSlower
  const percentile = totalUsers === 0 ? 0 : ((totalUsers - topWpmRank + 1) / totalUsers) * 100

  // Solved Breakdown Data
  const solvedAttempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    include: { challenge: true }
  })
  
  const solvedByDifficulty: Record<string, number> = {}
  const seenChallenges = new Set()
  solvedAttempts.forEach(a => {
    if (!seenChallenges.has(a.challengeId)) {
      solvedByDifficulty[a.challenge.difficulty] = (solvedByDifficulty[a.challenge.difficulty] || 0) + 1
      seenChallenges.add(a.challengeId)
    }
  })

  // Get total counts per difficulty from DB
  const difficultyCounts = await prisma.challenge.groupBy({
    by: ['difficulty'],
    _count: true
  })
  const totalByDifficulty: Record<string, number> = {}
  difficultyCounts.forEach(c => {
    totalByDifficulty[c.difficulty] = c._count
  })

  // Serialize data
  const serializedUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    bio: user.bio,
    location: user.location,
    website: user.website,
    linkedin: user.linkedin,
    github: user.github,
    image: user.image
  }

  const serializedAttempts = user.attempts.map(a => ({
    ...a,
    completedAt: a.completedAt.toISOString(),
  }))

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
            <UserGraphs attempts={serializedAttempts} totalCompleted={user.totalCompleted} />

            {/* Challenge History Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[var(--text-strong)] flex items-center gap-3">
                <span className="w-2 h-6 bg-[var(--primary)] rounded-full"></span>
                Challenge History
              </h2>
              {serializedAttempts.length > 0 ? (
                <div className="space-y-3">
                  {serializedAttempts.map((attempt: any) => (
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
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
