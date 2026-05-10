import prisma from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AttemptHistoryList from '@/components/AttemptHistoryList'

export default async function FullHistoryPage(props: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ page?: string }> 
}) {
  const params = await props.params
  const searchParams = await props.searchParams
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

  // Pagination Logic
  const pageSize = 20
  const currentPage = Number(searchParams.page) || 1
  const skip = (currentPage - 1) * pageSize

  const [allAttemptsRaw, totalAttempts] = await Promise.all([
    prisma.attempt.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      skip,
      take: pageSize,
      include: { challenge: true }
    }),
    prisma.attempt.count({ where: { userId: user.id } })
  ])

  const allAttempts = await Promise.all(allAttemptsRaw.map(async (a) => {
    const [betterThan, total] = await Promise.all([
      prisma.attempt.count({ where: { challengeId: a.challengeId, wpm: { lt: a.wpm } } }),
      prisma.attempt.count({ where: { challengeId: a.challengeId } })
    ])
    const percentile = total > 0 ? (betterThan / total) * 100 : 100
    
    return {
      ...a,
      completedAt: a.completedAt.toISOString(),
      percentile
    }
  }))

  const totalPages = Math.ceil(totalAttempts / pageSize)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

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
            <AttemptHistoryList attempts={allAttempts} />
          ) : (
            <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] border-dashed p-16 rounded-[40px] text-center">
              <p className="text-[var(--text-muted)] font-medium text-lg">No challenges completed yet.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between bg-[var(--panel-bg)] border border-[var(--panel-border)] p-4 rounded-3xl shadow-xl">
            <Link
              href={hasPrevPage ? `?page=${currentPage - 1}` : '#'}
              className={`px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${
                hasPrevPage 
                  ? 'bg-[var(--panel-border)]/50 hover:bg-[var(--panel-border)] text-[var(--text-strong)]' 
                  : 'text-[var(--text-muted)] cursor-not-allowed opacity-50'
              }`}
            >
              ← Previous
            </Link>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Page</span>
              <span className="px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl font-mono font-black border border-[var(--primary)]/20">
                {currentPage} <span className="text-[var(--text-muted)] font-normal text-[10px]">of {totalPages}</span>
              </span>
            </div>

            <Link
              href={hasNextPage ? `?page=${currentPage + 1}` : '#'}
              className={`px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${
                hasNextPage 
                  ? 'bg-[var(--panel-border)]/50 hover:bg-[var(--panel-border)] text-[var(--text-strong)]' 
                  : 'text-[var(--text-muted)] cursor-not-allowed opacity-50'
              }`}
            >
              Next →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
