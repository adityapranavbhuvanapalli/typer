export default function LeaderboardsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
      <div className="flex justify-center mb-6">
        <div className="h-12 bg-[var(--panel-border)] rounded w-96"></div>
      </div>
      <div className="flex justify-center mb-16">
         <div className="h-4 bg-[var(--panel-border)] rounded w-1/2"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[var(--panel-bg)] rounded-3xl p-6 border border-[var(--panel-border)]">
            <div className="h-8 bg-[var(--panel-border)] rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, j) => (
                <div key={j} className="flex justify-between items-center p-4 rounded-xl border border-[var(--panel-border)]">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-[var(--panel-border)] rounded"></div>
                    <div className="w-8 h-8 rounded-full bg-[var(--panel-border)]"></div>
                    <div className="h-5 bg-[var(--panel-border)] rounded w-24"></div>
                  </div>
                  <div className="h-5 bg-[var(--panel-border)] rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
