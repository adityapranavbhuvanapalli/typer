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
      orderBy: [{ isDaily: 'desc' }, { serialNo: 'asc' }],
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
    completedChallengeIds = new Set(attempts.map((a) => a.challengeId))
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'HARD':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      case 'SUPER_HARD':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      default:
        return 'text-[var(--text-muted)] bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-black text-[var(--text-strong)]">Challenges</h1>
          <p className="text-[var(--text-muted)]">Pick a challenge and test your speed.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-2 text-sm font-semibold text-[var(--text-muted)]">
            Showing {skip + 1} - {Math.min(skip + pageSize, totalCount)} of {totalCount} problems
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1 rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] p-1 shadow-sm">
              {page > 1 ? (
                <Link
                  href={`/challenges?page=${page - 1}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-[var(--text-strong)] transition-colors hover:bg-[var(--panel-border)]"
                >
                  &lt;
                </Link>
              ) : (
                <button
                  disabled
                  className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full font-bold text-[var(--text-muted)] opacity-50"
                >
                  &lt;
                </button>
              )}

              <span className="px-2 text-xs font-bold text-[var(--text-muted)]">
                {page} / {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={`/challenges?page=${page + 1}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-[var(--text-strong)] transition-colors hover:bg-[var(--panel-border)]"
                >
                  &gt;
                </Link>
              ) : (
                <button
                  disabled
                  className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full font-bold text-[var(--text-muted)] opacity-50"
                >
                  &gt;
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-xl">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--panel-border)] bg-[var(--panel-bg)] text-sm tracking-wider text-[var(--text-muted)] uppercase">
              <th className="w-12 p-4 text-center"></th>
              <th className="p-4">Title</th>
              <th className="w-40 p-4">Difficulty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/20">
            {challenges.map((c) => {
              const isCompleted = completedChallengeIds.has(c.id)

              return (
                <tr key={c.id} className="group transition-colors hover:bg-[var(--panel-bg)]">
                  <td className="p-4 text-center">
                    {isCompleted && (
                      <span className="font-bold text-green-500" title="Completed">
                        ✓
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-lg font-medium text-[var(--text-strong)] transition-colors group-hover:text-[var(--primary)]">
                    <Link
                      href={`/challenge/${c.id}`}
                      className="flex h-full w-full items-center gap-3"
                    >
                      {c.title}
                      {c.isDaily && (
                        <span className="animate-pulse rounded bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                          DAILY
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded border px-2 py-1 text-xs font-bold ${getDifficultyColor(c.difficulty)}`}
                    >
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
        <div className="mt-8 flex items-center justify-center gap-4">
          {page > 1 ? (
            <Link
              href={`/challenges?page=${page - 1}`}
              className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-6 py-2 font-semibold text-[var(--text-strong)] transition-colors hover:bg-[var(--panel-border)]"
            >
              &lt;
            </Link>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-lg border border-[var(--panel-border)]/50 bg-[var(--panel-bg)]/50 px-6 py-2 font-semibold text-[var(--text-muted)] opacity-50"
            >
              &lt;
            </button>
          )}

          <span className="font-medium text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`/challenges?page=${page + 1}`}
              className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-6 py-2 font-semibold text-[var(--text-strong)] transition-colors hover:bg-[var(--panel-border)]"
            >
              &gt;
            </Link>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-lg border border-[var(--panel-border)]/50 bg-[var(--panel-bg)]/50 px-6 py-2 font-semibold text-[var(--text-muted)] opacity-50"
            >
              &gt;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
