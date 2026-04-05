import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
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
  
  const percentile = totalUsersWithCompleted === 0 ? 0 : (usersSlowerThanMe / totalUsersWithCompleted) * 100

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <img 
          src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
          className="w-32 h-32 rounded-full border-4 border-[var(--metric-speed)] shadow-lg" 
          alt="Avatar" 
        />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-black text-[var(--text-strong)] mb-2">{user.name || 'Anonymous User'}</h1>
          <p className="text-[var(--text-muted)]">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        
        {/* Highlight Stats */}
        <div className="flex gap-4">
          <div className="bg-[var(--panel-bg)] border border-[var(--metric-speed)]/30 p-4 rounded-xl text-center">
            <p className="text-sm text-[var(--metric-speed)] font-bold mb-1">Top Speed</p>
            <p className="text-3xl font-mono font-black text-[var(--text-strong)]">{Math.round(user.topWpm)}</p>
          </div>
          <div className="bg-[var(--panel-bg)] border border-[var(--metric-streak)]/30 p-4 rounded-xl text-center">
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
      <UserGraphs attempts={user.attempts} />

    </div>
  )
}
