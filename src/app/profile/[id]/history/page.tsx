import prisma from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'
import { ArrowLeft, Clock, Zap, Target } from 'lucide-react'

export default async function FullHistoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await auth()
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: params.id },
        { username: params.id }
      ]
    }
  })

  if (!user) notFound()

  // Canonical redirect
  if (params.id === user.id && user.username) {
    redirect(`/profile/${user.username}/history`)
  }

  // Fetch all history (limited to 500 for safety, but with challenge details)
  const allAttempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: 'desc' },
    take: 500,
    include: { challenge: true }
  })

  return (
    <div className="min-h-screen bg-[var(--background)] py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Link 
              href={`/profile/${user.username || user.id}`}
              className="text-xs font-black text-[var(--primary)] hover:text-blue-400 flex items-center gap-2 uppercase tracking-widest mb-4 transition-all"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Profile
            </Link>
            <h1 className="text-4xl font-black text-[var(--text-strong)] tracking-tighter">Challenge History</h1>
            <p className="text-[var(--text-muted)] font-medium">Full record of all your typing sessions</p>
          </div>
          <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] px-6 py-4 rounded-3xl flex items-center gap-6 shadow-xl">
             <div className="text-center">
              <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Total</p>
              <p className="text-xl font-black text-[var(--text-strong)]">{user.totalCompleted}</p>
            </div>
            <div className="w-px h-8 bg-[var(--panel-border)]" />
            <div className="text-center">
              <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Best</p>
              <p className="text-xl font-black text-[var(--primary)]">{Math.round(user.topWpm)} <span className="text-xs font-medium">WPM</span></p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {allAttempts.length > 0 ? (
            allAttempts.map((attempt) => (
              <div 
                key={attempt.id} 
                className="bg-[var(--panel-bg)] border border-[var(--panel-border)] p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[var(--primary)]/30 transition-all group cursor-default shadow-lg hover:shadow-primary/5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-black text-lg text-[var(--text-strong)] truncate group-hover:text-[var(--primary)] transition-colors">
                      {attempt.challenge.title}
                    </h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                      attempt.challenge.difficulty === 'EASY' ? 'text-[var(--diff-easy)] border-[var(--diff-easy)]/30 bg-[var(--diff-easy)]/10' :
                      attempt.challenge.difficulty === 'MEDIUM' ? 'text-[var(--diff-med)] border-[var(--diff-med)]/30 bg-[var(--diff-med)]/10' :
                      attempt.challenge.difficulty === 'HARD' ? 'text-[var(--diff-hard)] border-[var(--diff-hard)]/30 bg-[var(--diff-hard)]/10' :
                      'text-[var(--diff-super)] border-[var(--diff-super)]/30 bg-[var(--diff-super)]/10'
                    }`}>
                      {attempt.challenge.difficulty.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {(() => {
                        const date = new Date(attempt.completedAt);
                        const h = date.getUTCHours();
                        const m = date.getUTCMinutes();
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const displayH = h % 12 || 12;
                        const displayM = m < 10 ? `0${m}` : m;
                        return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()} ${displayH}:${displayM} ${ampm} UTC`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-12 md:pl-8 md:border-l border-[var(--panel-border)]">
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--metric-speed)] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1">
                      <Zap className="w-3 h-3 fill-[var(--metric-speed)]" />
                      Speed
                    </p>
                    <p className="text-2xl font-mono font-black text-[var(--text-strong)]">
                      {Math.round(attempt.wpm)} 
                      <span className="text-xs font-normal text-[var(--text-muted)] ml-1">WPM</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--success)] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1">
                      <Target className="w-3 h-3" />
                      Accuracy
                    </p>
                    <p className="text-2xl font-mono font-black text-[var(--text-strong)]">
                      {Math.round(attempt.accuracy)}%
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] border-dashed p-16 rounded-[40px] text-center">
              <p className="text-[var(--text-muted)] font-medium text-lg">No challenges completed yet.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        {allAttempts.length >= 500 && (
          <div className="mt-8 text-center text-[var(--text-muted)] text-sm font-medium">
            Showing the 500 most recent submissions.
          </div>
        )}
      </div>
    </div>
  )
}
