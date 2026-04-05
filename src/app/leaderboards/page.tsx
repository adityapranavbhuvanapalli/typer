import { PrismaClient, User } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'

const prisma = new PrismaClient()

export default async function LeaderboardsPage() {
  const [topWpm, mostCompleted, longestStreak] = await Promise.all([
    prisma.user.findMany({ orderBy: { topWpm: 'desc' }, take: 25 }),
    prisma.user.findMany({ orderBy: { totalCompleted: 'desc' }, take: 25 }),
    prisma.user.findMany({ orderBy: { longestStreak: 'desc' }, take: 25 })
  ])

  const renderList = <K extends keyof User>(
    users: User[],
    valueKey: K,
    formatValue: (v: NonNullable<User[K]>) => string
  ) => (
    <div className="space-y-3">
      {users.length === 0 && (
        <p className="p-4 text-center text-[var(--text-muted)] italic">No data yet.</p>
      )}
      {users.map((u, i) => (
        <Link
          href={`/profile/${u.id}`}
          key={u.id}
          className="group flex items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 transition-colors hover:bg-[var(--panel-border)]"
        >
          <div className="flex items-center gap-4">
            <span
              className={`w-8 text-center font-black ${i < 3 ? 'text-yellow-500' : 'text-[var(--text-muted)]'}`}
            >
              #{i + 1}
            </span>
            <div className="flex items-center gap-3">
              <Image
                src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full border border-blue-800"
                alt=""
              />
              <span className="font-semibold text-[var(--text-muted)] group-hover:text-[var(--text-strong)]">
                {u.name || 'Anonymous'}
              </span>
            </div>
          </div>
          <span className="font-mono font-bold text-blue-400">
            {formatValue(u[valueKey] as NonNullable<User[K]>)}
          </span>
        </Link>
      ))}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-4 text-center text-5xl font-black text-[var(--text-strong)]">
        Global Leaderboards
      </h1>
      <p className="mx-auto mb-16 max-w-2xl text-center text-[var(--text-muted)]">
        Compete with the fastest typists online. Rankings are updated in real-time as users complete
        challenges.
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* WPM Leaderboard */}
        <div className="rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--text-strong)]">
              <span className="text-blue-500">⚡</span> Top Speed
            </h2>
          </div>
          {renderList(topWpm, 'topWpm', (v) => `${Math.round(v)} WPM`)}
        </div>

        {/* Most Completed Leaderboard */}
        <div className="rounded-3xl border border-green-900/30 bg-[var(--panel-bg)] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--text-strong)]">
              <span className="text-green-500">🔥</span> Most Solved
            </h2>
          </div>
          {renderList(mostCompleted, 'totalCompleted', (v) => `${v} challenges`)}
        </div>

        {/* Longest Streak Leaderboard */}
        <div className="rounded-3xl border border-orange-900/30 bg-[var(--panel-bg)] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--text-strong)]">
              <span className="text-orange-500">📅</span> Longest Streaks
            </h2>
          </div>
          {renderList(longestStreak, 'longestStreak', (v) => `${v} days`)}
        </div>
      </div>
    </div>
  )
}
