import prisma from '@/lib/db'
import Link from 'next/link'

export default async function LeaderboardsPage() {
  const [topWpm, mostCompleted, longestStreak] = await Promise.all([
    prisma.user.findMany({ orderBy: { topWpm: 'desc' }, take: 25 }),
    prisma.user.findMany({ orderBy: { totalCompleted: 'desc' }, take: 25 }),
    prisma.user.findMany({ orderBy: { longestStreak: 'desc' }, take: 25 })
  ])

  const renderList = (users: any[], valueKey: string, formatValue: (v: any) => string) => (
    <div className="space-y-3">
      {users.length === 0 && <p className="text-[var(--text-muted)] italic p-4 text-center">No data yet.</p>}
      {users.map((u, i) => (
        <Link href={`/profile/${u.id}`} key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--panel-bg)] hover:bg-[var(--panel-border)] border border-[var(--panel-border)] transition-colors group">
          <div className="flex items-center gap-4">
            <span className={`w-8 text-center font-black ${i < 3 ? 'text-yellow-500' : 'text-[var(--text-muted)]'}`}>
              #{i + 1}
            </span>
            <div className="flex items-center gap-3">
              <img src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-8 h-8 rounded-full border border-blue-800" alt="" />
              <span className="font-semibold text-[var(--text-muted)] group-hover:text-[var(--text-strong)]">{u.name || 'Anonymous'}</span>
            </div>
          </div>
          <span className="font-mono font-bold text-blue-400">{formatValue(u[valueKey])}</span>
        </Link>
      ))}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-black text-[var(--text-strong)] mb-4 text-center">Global Leaderboards</h1>
      <p className="text-center text-[var(--text-muted)] mb-16 max-w-2xl mx-auto">
        Compete with the fastest typists online. Rankings are updated in real-time as users complete challenges.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* WPM Leaderboard */}
        <div className="bg-[var(--panel-bg)] rounded-3xl p-6 border border-[var(--panel-border)]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-strong)] flex items-center gap-2">
              <span className="text-blue-500">⚡</span> Top Speed
            </h2>
          </div>
          {renderList(topWpm, 'topWpm', v => `${Math.round(v)} WPM`)}
        </div>

        {/* Most Completed Leaderboard */}
        <div className="bg-[var(--panel-bg)] rounded-3xl p-6 border border-green-900/30">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-strong)] flex items-center gap-2">
              <span className="text-green-500">🔥</span> Most Solved
            </h2>
          </div>
          {renderList(mostCompleted, 'totalCompleted', v => `${v} challenges`)}
        </div>

        {/* Longest Streak Leaderboard */}
        <div className="bg-[var(--panel-bg)] rounded-3xl p-6 border border-orange-900/30">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-strong)] flex items-center gap-2">
              <span className="text-orange-500">📅</span> Longest Streaks
            </h2>
          </div>
          {renderList(longestStreak, 'longestStreak', v => `${v} days`)}
        </div>

      </div>
    </div>
  )
}
