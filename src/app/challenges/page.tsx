import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { auth } from '@/auth'

const prisma = new PrismaClient()

export default async function ProblemsPage(props: { searchParams: Promise<{ page?: string }> }) {
  const params = await props.searchParams
  const page = parseInt(params.page || '1') || 1
  const pageSize = 25
  const skip = (page - 1) * pageSize

  const session = await auth()
  
  // We want to fetch challenges, and potentially check if user has attempted them
  const [challenges, totalCount] = await Promise.all([
    prisma.challenge.findMany({
      orderBy: [
        { isDaily: 'desc' },
        { serialNo: 'asc' },
      ],
      skip,
      take: pageSize
    }),
    prisma.challenge.count()
  ])
  
  const totalPages = Math.ceil(totalCount / pageSize)

  // If user is logged in, fetch their attempts to show "completed" checkmarks
  let completedChallengeIds = new Set<string>()
  if (session?.user?.id) {
    const attempts = await prisma.attempt.findMany({
      where: { userId: session.user.id },
      select: { challengeId: true }
    })
    completedChallengeIds = new Set(attempts.map(a => a.challengeId))
  }

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'EASY': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'HARD': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      case 'SUPER_HARD': return 'text-red-500 bg-red-500/10 border-red-500/20'
      default: return 'text-[var(--text-muted)] bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-strong)] mb-2">Challenges</h1>
          <p className="text-[var(--text-muted)]">Pick a challenge and test your speed.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-[var(--text-muted)] bg-[var(--panel-bg)] px-4 py-2 rounded-full border border-[var(--panel-border)]">
            Showing {skip + 1} - {Math.min(skip + pageSize, totalCount)} of {totalCount} problems
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-1 bg-[var(--panel-bg)] p-1 rounded-full border border-[var(--panel-border)] shadow-sm">
              {page > 1 ? (
                <Link href={`/challenges?page=${page - 1}`} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--panel-border)] text-[var(--text-strong)] font-bold transition-colors">&lt;</Link>
              ) : (
                <button disabled className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] opacity-50 cursor-not-allowed font-bold">&lt;</button>
              )}
              
              <span className="px-2 text-xs font-bold text-[var(--text-muted)]">
                {page} / {totalPages}
              </span>

              {page < totalPages ? (
                <Link href={`/challenges?page=${page + 1}`} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--panel-border)] text-[var(--text-strong)] font-bold transition-colors">&gt;</Link>
              ) : (
                <button disabled className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] opacity-50 cursor-not-allowed font-bold">&gt;</button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--panel-bg)] rounded-2xl border border-[var(--panel-border)] overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--panel-bg)] text-[var(--text-muted)] text-sm tracking-wider uppercase border-b border-[var(--panel-border)]">
              <th className="p-4 w-12 text-center"></th>
              <th className="p-4">Title</th>
              <th className="p-4 w-40">Difficulty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/20">
            {challenges.map(c => {
              const isCompleted = completedChallengeIds.has(c.id)

              return (
                <tr key={c.id} className="hover:bg-[var(--panel-bg)] transition-colors group">
                  <td className="p-4 text-center">
                    {isCompleted && (
                      <span className="text-green-500 font-bold" title="Completed">✓</span>
                    )}
                  </td>
                  <td className="p-4 font-medium text-[var(--text-strong)] group-hover:text-[var(--primary)] transition-colors text-lg">
                    <Link href={`/challenge/${c.id}`} className="flex items-center gap-3 w-full h-full">
                      {c.title}
                      {c.isDaily && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500 text-white animate-pulse">DAILY</span>
                      )}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${getDifficultyColor(c.difficulty)}`}>
                      {c.difficulty.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          {page > 1 ? (
            <Link href={`/challenges?page=${page - 1}`} className="px-6 py-2 bg-[var(--panel-bg)] hover:bg-[var(--panel-border)] border border-[var(--panel-border)] rounded-lg text-[var(--text-strong)] font-semibold transition-colors">&lt;</Link>
          ) : (
            <button disabled className="px-6 py-2 bg-[var(--panel-bg)]/50 border border-[var(--panel-border)]/50 rounded-lg text-[var(--text-muted)] opacity-50 cursor-not-allowed font-semibold">&lt;</button>
          )}
          
          <span className="text-[var(--text-muted)] font-medium">Page {page} of {totalPages}</span>

          {page < totalPages ? (
            <Link href={`/challenges?page=${page + 1}`} className="px-6 py-2 bg-[var(--panel-bg)] hover:bg-[var(--panel-border)] border border-[var(--panel-border)] rounded-lg text-[var(--text-strong)] font-semibold transition-colors">&gt;</Link>
          ) : (
            <button disabled className="px-6 py-2 bg-[var(--panel-bg)]/50 border border-[var(--panel-border)]/50 rounded-lg text-[var(--text-muted)] opacity-50 cursor-not-allowed font-semibold">&gt;</button>
          )}
        </div>
      )}
    </div>
  )
}
