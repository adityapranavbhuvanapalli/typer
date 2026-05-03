export default function ChallengesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-pulse">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="h-10 bg-[var(--panel-border)] rounded w-64 mb-4"></div>
          <div className="h-4 bg-[var(--panel-border)] rounded w-96"></div>
        </div>
        <div className="h-10 bg-[var(--panel-border)] rounded-full w-48"></div>
      </div>

      <div className="bg-[var(--panel-bg)] rounded-2xl border border-[var(--panel-border)] overflow-hidden shadow-xl">
        <div className="w-full h-12 bg-[var(--panel-border)]/50 border-b border-[var(--panel-border)]"></div>
        <div className="divide-y divide-blue-900/20">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center p-4">
              <div className="w-8 h-8 rounded bg-[var(--panel-border)]/50 mr-4"></div>
              <div className="h-6 bg-[var(--panel-border)] rounded w-1/3"></div>
              <div className="ml-auto h-6 bg-[var(--panel-border)] rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
