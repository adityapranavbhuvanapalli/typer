import Link from 'next/link'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function Home() {
  const dailyChallenge = await prisma.challenge.findFirst({
    where: { isDaily: true }
  })

  const topUsers = await prisma.user.findMany({
    where: { totalCompleted: { gt: 0 } },
    orderBy: { topWpm: 'desc' },
    take: 5
  })

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12">
      {/* Hero Section */}
      <section className="space-y-6 pt-12 text-center">
        <h1 className="bg-gradient-to-br from-white to-blue-200 bg-clip-text text-6xl font-black tracking-tight text-transparent md:text-7xl">
          The ultimate platform for
          <br /> speed typing.
        </h1>
        <p className="mx-auto max-w-2xl text-xl font-medium text-[var(--text-muted)]">
          Whether you want to climb the leaderboards, improve your WPM, or just grind your daily
          streak, typer is where the fastest typists compete.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/challenges"
            className="rounded-full bg-[var(--primary)] px-8 py-3 font-bold text-[var(--text-strong)] shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:bg-[var(--primary-hover)]"
          >
            Get Started
          </Link>
          <Link
            href="/how-to"
            className="rounded-full bg-[var(--panel-border)] px-8 py-3 font-bold text-[var(--text-muted)] transition-all hover:bg-[var(--panel-bg)]"
          >
            How it works
          </Link>
        </div>
      </section>

      {/* Daily Challenge Banner */}
      {dailyChallenge && (
        <section className="mt-8 w-full">
          <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl border border-blue-500 bg-gradient-to-br from-blue-900/30 to-blue-800/10 p-8 shadow-[0_0_30px_rgba(59,130,246,0.15)] md:flex-row md:p-12">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-sm font-semibold text-blue-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                </span>
                Daily Challenge Live
              </div>
              <h2 className="text-4xl font-bold text-[var(--text-strong)]">
                {dailyChallenge.title}
              </h2>
              <p className="max-w-lg text-[var(--text-muted)]">
                Complete today&apos;s official challenge to maintain your streak and climb the
                global leaderboards.
              </p>
            </div>

            <Link
              href={`/challenge/${dailyChallenge.id}`}
              className="group relative overflow-hidden rounded-xl bg-white px-8 py-4 text-lg font-black text-blue-900 shadow-xl transition-all hover:shadow-2xl"
            >
              <div className="absolute inset-0 translate-y-full transform bg-blue-100 transition-transform duration-300 group-hover:translate-y-0" />
              <span className="relative z-10">Start Daily</span>
            </Link>
          </div>
        </section>
      )}

      {/* Mini Leaderboard preview */}
      <section className="mt-8 mb-24 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-8 shadow-lg">
          <h3 className="mb-6 text-2xl font-bold text-[var(--text-strong)]">Top Typists</h3>
          <ul className="space-y-4">
            {topUsers.length === 0 ? (
              <p className="text-[var(--text-muted)] italic">
                No one has completed a challenge yet. Be the first!
              </p>
            ) : (
              topUsers.map((user, idx) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-6 text-xl font-black text-blue-400 opacity-70">
                      #{idx + 1}
                    </div>
                    <div className="font-semibold text-[var(--text-muted)]">
                      {user.name || 'Anonymous'}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-blue-400">
                    {Math.round(user.topWpm)} WPM
                  </div>
                </li>
              ))
            )}
          </ul>
          <Link
            href="/leaderboards"
            className="mt-6 inline-block font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            View full leaderboards &rarr;
          </Link>
        </div>

        <div className="flex flex-col justify-center rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-8 shadow-lg">
          <h3 className="mb-4 text-3xl font-bold text-[var(--text-strong)]">Prove your speed.</h3>
          <p className="mb-8 text-lg text-[var(--text-muted)]">
            Four distinct tiers of difficulty. Track your percentile ranking, overall accuracy, and
            climb to the top.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center font-bold text-green-400">
              EASY
            </div>
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center font-bold text-yellow-400">
              MEDIUM
            </div>
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-center font-bold text-orange-400">
              HARD
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center font-bold text-red-500">
              SUPER HARD
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
