import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import UserGraphs from './UserGraphs'
import { auth } from '@/auth'
import EditProfileModal from './EditProfileModal'

export default async function ProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await auth()
  
  const [user, totalUsersWithCompleted] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      include: { 
        attempts: {
          orderBy: { completedAt: 'desc' },
          take: 10,
          include: { challenge: true }
        } 
      }
    }),
    prisma.user.count({ where: { totalCompleted: { gt: 0 } } })
  ])

  if (!user) notFound()

  const isOwnProfile = session?.user?.id === user.id

  // Percentiles (Fastest Query logic)
  const usersSlowerThanMe = await prisma.user.count({
    where: { totalCompleted: { gt: 0 }, topWpm: { lt: user.topWpm } }
  })

  const percentile = totalUsersWithCompleted === 0 ? 0 : (usersSlowerThanMe / totalUsersWithCompleted) * 100

  // Serialize data for client components to avoid serialization issues
  const serializedUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    bio: user.bio,
    website: user.website,
    linkedin: user.linkedin,
    github: user.github,
    image: user.image
  }

  const serializedAttempts = user.attempts.map(a => ({
    ...a,
    completedAt: a.completedAt.toISOString(),
  }))

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <img
          src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Anonymous'}`}
          className="w-32 h-32 rounded-full border-4 border-[var(--metric-speed)] shadow-lg"
          alt="Avatar"
        />
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
            <h1 className="text-4xl font-black text-[var(--text-strong)]">
              {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Anonymous User'}
            </h1>
            {isOwnProfile && (
              <EditProfileModal user={serializedUser} />
            )}
          </div>
          <p className="text-[var(--primary)] font-bold text-lg mb-2">@{user.username}</p>
          <p className="text-[var(--text-muted)] text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
          {user.bio && <p className="mt-4 text-[var(--text-strong)] max-w-2xl">{user.bio}</p>}
        </div>

        {/* Highlight Stats */}
        <div className="flex gap-4">
          <div className="bg-[var(--panel-bg)] border border-[var(--metric-speed)]/30 p-4 rounded-xl text-center min-w-[120px]">
            <p className="text-sm text-[var(--metric-speed)] font-bold mb-1">Top Speed</p>
            <p className="text-3xl font-mono font-black text-[var(--text-strong)]">{Math.round(user.topWpm)}</p>
          </div>
          <div className="bg-[var(--panel-bg)] border border-[var(--metric-streak)]/30 p-4 rounded-xl text-center min-w-[120px]">
            <p className="text-sm text-[var(--metric-streak)] font-bold mb-1">Max Streak</p>
            <p className="text-3xl font-mono font-black text-[var(--text-strong)]">{user.longestStreak}</p>
          </div>
        </div>
      </div>

      {/* Percentile Banner */}
      {user.totalCompleted > 0 && (
        <div className="w-full bg-gradient-to-r from-[var(--hero-from)] to-[var(--hero-to)] p-[1px] rounded-xl mb-12 shadow-xl border border-[var(--panel-border)]">
          <div className="bg-[var(--panel-bg)] rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-strong)] mb-2">Speed Percentile</h3>
              <p className="text-[var(--text-muted)] text-sm">You type faster than <strong className="text-[var(--metric-speed)]">{percentile.toFixed(1)}%</strong> of all users.</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-xs text-[var(--text-muted)] mb-1">Global Standing based on Top WPM</p>
              <div className="w-64 h-3 bg-[var(--panel-border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--hero-from)] to-[var(--hero-to)]"
                  style={{ width: `${percentile}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis Component */}
      <UserGraphs attempts={serializedAttempts} />

      {/* Recent Challenges Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-black text-[var(--text-strong)] mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-[var(--primary)] rounded-full"></span>
          Recent Challenges
        </h2>
        {user.attempts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.attempts.map((attempt) => (
              <div key={attempt.id} className="bg-[var(--panel-bg)] border border-[var(--panel-border)] p-5 rounded-2xl flex items-center justify-between hover:border-[var(--primary)]/30 transition-all group">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--text-strong)] truncate group-hover:text-[var(--primary)] transition-colors">{attempt.challenge.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{new Date(attempt.completedAt).toLocaleDateString()} at {new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs text-[var(--metric-speed)] font-bold uppercase tracking-wider">Speed</p>
                    <p className="text-xl font-mono font-black text-[var(--text-strong)]">{Math.round(attempt.wpm)} <span className="text-xs font-normal text-[var(--text-muted)]">WPM</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--success)] font-bold uppercase tracking-wider">Accuracy</p>
                    <p className="text-xl font-mono font-black text-[var(--text-strong)]">{Math.round(attempt.accuracy)}<span className="text-xs font-normal text-[var(--text-muted)]">%</span></p>
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
  )
}
