import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import UserGraphs from './UserGraphs'

const prisma = new PrismaClient()

export default async function ProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { attempts: true }
  })

  if (!user) notFound()

  // Percentiles (Fastest Query logic)
  const totalUsersWithCompleted = await prisma.user.count({ where: { totalCompleted: { gt: 0 } } })
  const usersSlowerThanMe = await prisma.user.count({
    where: { totalCompleted: { gt: 0 }, topWpm: { lt: user.topWpm } }
  })

  const percentile =
    totalUsersWithCompleted === 0 ? 0 : (usersSlowerThanMe / totalUsersWithCompleted) * 100

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Profile Header */}
      <div className="mb-12 flex flex-col items-center gap-8 md:flex-row md:items-start">
        <Image
          src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          width={128}
          height={128}
          className="h-32 w-32 rounded-full border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          alt="Avatar"
        />
        <div className="flex-1 text-center md:text-left">
          <h1 className="mb-2 text-4xl font-black text-[var(--text-strong)]">
            {user.name || 'Anonymous User'}
          </h1>
          <p className="text-[var(--text-muted)]">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Highlight Stats */}
        <div className="flex gap-4">
          <div className="rounded-xl border border-blue-500/30 bg-[var(--panel-bg)] p-4 text-center">
            <p className="mb-1 text-sm font-bold text-blue-300">Top Speed</p>
            <p className="font-mono text-3xl font-black text-[var(--text-strong)]">
              {Math.round(user.topWpm)}
            </p>
          </div>
          <div className="rounded-xl border border-orange-500/30 bg-orange-900/20 p-4 text-center">
            <p className="mb-1 text-sm font-bold text-orange-300">Max Streak</p>
            <p className="font-mono text-3xl font-black text-[var(--text-strong)]">
              {user.longestStreak}
            </p>
          </div>
        </div>
      </div>

      {/* Percentile Banner */}
      {user.totalCompleted > 0 && (
        <div className="mb-12 w-full rounded-xl border border-blue-800 bg-gradient-to-r from-blue-900 to-black p-1 shadow-xl">
          <div className="flex flex-col items-center justify-between rounded-lg bg-[var(--panel-bg)] p-6 md:flex-row">
            <div>
              <h3 className="mb-2 text-2xl font-bold text-[var(--text-strong)]">
                Speed Percentile
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                You type faster than{' '}
                <strong className="text-blue-400">{percentile.toFixed(1)}%</strong> of all users.
              </p>
            </div>
            <div className="mt-4 text-right md:mt-0">
              <p className="mb-1 text-xs text-[var(--text-muted)]">
                Global Standing based on Top WPM
              </p>
              <div className="h-3 w-64 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                  style={{ width: `${percentile}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis Component */}
      <UserGraphs attempts={user.attempts} />
    </div>
  )
}
