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
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-16">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12">
        <h1 
          className="text-6xl md:text-7xl font-black tracking-tight"
          style={{ 
            background: 'var(--hero-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          The ultimate platform for
          <br /> speed typing.
        </h1>
        <p className="text-[var(--text-muted)] text-xl max-w-2xl mx-auto font-medium">
          Whether you want to climb the leaderboards, improve your WPM, or just grind your daily streak, typer is where the fastest typists compete.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/challenges" className="px-8 py-3 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-strong)] font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
            Get Started
          </Link>
          <Link href="/how-to" className="px-8 py-3 rounded-full bg-[var(--panel-border)] hover:bg-[var(--panel-bg)] text-[var(--text-muted)] font-bold transition-all">
            How it works
          </Link>
        </div>
      </section>

      {/* Daily Challenge Banner */}
      {dailyChallenge && (
        <section className="w-full mt-8">
          <div className="relative overflow-hidden rounded-2xl border border-blue-500 bg-gradient-to-br from-blue-900/30 to-blue-800/10 p-8 md:p-12 shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] font-semibold text-sm border border-[var(--badge-blue-border)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Daily Challenge Live
              </div>
              <h2 className="text-4xl font-bold text-[var(--text-strong)]">{dailyChallenge.title}</h2>
              <p className="text-[var(--text-muted)] max-w-lg">
                Complete today's official challenge to maintain your streak and climb the global leaderboards.
              </p>
            </div>
            
            <Link 
              href={`/challenge/${dailyChallenge.id}`}
              className="group relative px-8 py-4 bg-white text-blue-900 font-black rounded-xl text-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="absolute inset-0 bg-blue-100 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10">Start Daily</span>
            </Link>
          </div>
        </section>
      )}

      {/* Mini Leaderboard preview */}
      <section className="mt-8 mb-24 grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-[var(--panel-bg)] border border-[var(--panel-border)] shadow-lg">
          <h3 className="text-2xl font-bold text-[var(--text-strong)] mb-6">Top Typists</h3>
          <ul className="space-y-4">
            {topUsers.length === 0 ? (
              <p className="text-[var(--text-muted)] italic">No one has completed a challenge yet. Be the first!</p>
            ) : (
              topUsers.map((user: any, idx: number) => (
                <li key={user.id} className="flex justify-between items-center bg-[var(--panel-bg)] p-4 rounded-xl border border-[var(--panel-border)]">
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-black text-[var(--metric-speed)] opacity-70 w-6">#{idx + 1}</div>
                    <div className="font-semibold text-[var(--text-muted)]">{user.name || 'Anonymous'}</div>
                  </div>
                  <div className="text-[var(--metric-speed)] font-mono font-bold">{Math.round(user.topWpm)} WPM</div>
                </li>
              ))
            )}
          </ul>
          <Link href="/leaderboards" className="inline-block mt-6 text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            View full leaderboards &rarr;
          </Link>
        </div>
        
        <div className="p-8 rounded-2xl bg-[var(--panel-bg)] border border-[var(--panel-border)] shadow-lg flex flex-col justify-center">
             <h3 className="text-3xl font-bold text-[var(--text-strong)] mb-4">Prove your speed.</h3>
             <p className="text-[var(--text-muted)] text-lg mb-8">Four distinct tiers of difficulty. Track your percentile ranking, overall accuracy, and climb to the top.</p>
             <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-xl bg-[var(--diff-easy)]/10 border border-[var(--diff-easy)]/20 text-[var(--diff-easy)] font-bold text-center">EASY</div>
               <div className="p-4 rounded-xl bg-[var(--diff-med)]/10 border border-[var(--diff-med)]/20 text-[var(--diff-med)] font-bold text-center">MEDIUM</div>
               <div className="p-4 rounded-xl bg-[var(--diff-hard)]/10 border border-[var(--diff-hard)]/20 text-[var(--diff-hard)] font-bold text-center">HARD</div>
               <div className="p-4 rounded-xl bg-[var(--diff-super)]/10 border border-[var(--diff-super)]/20 text-[var(--diff-super)] font-bold text-center">SUPER HARD</div>
             </div>
        </div>
      </section>

    </div>
  )
}
