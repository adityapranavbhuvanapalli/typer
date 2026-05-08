export default function ChallengeLoading() {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 pb-24">
      <div className="w-full flex flex-col items-center animate-pulse">
        {/* HUD Header Skeleton */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4">
          <div>
            <div className="h-8 bg-[var(--panel-border)] rounded w-64 mb-3"></div>
            <div className="h-6 bg-[var(--panel-border)] rounded-full w-24"></div>
          </div>
        </div>

        {/* Engine Skeleton */}
        <div className="relative w-full max-w-4xl p-8 rounded-xl bg-[var(--panel-bg)] border border-[var(--panel-border)] shadow-2xl h-[300px]">
          <div className="flex flex-wrap gap-2">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="h-6 bg-[var(--panel-border)]/50 rounded w-16" style={{ width: `${Math.random() * 40 + 40}px`}}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
