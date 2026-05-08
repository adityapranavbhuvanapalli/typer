export default function LeaderboardsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
      <div className="flex justify-center mb-6">
        <div className="h-12 bg-[var(--panel-border)] rounded w-96"></div>
      </div>
      <div className="flex justify-center mb-16">
         <div className="h-4 bg-[var(--panel-border)] rounded w-1/2"></div>
      </div>

      <div className="w-full bg-[var(--panel-bg)] rounded-2xl border border-[var(--panel-border)] shadow-xl overflow-hidden">
        {/* Tab Header Skeleton */}
        <div className="flex border-b border-[var(--panel-border)] bg-[var(--panel-bg)]/50 pt-2 px-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-6 py-3 w-32 h-10 border-b-2 border-transparent">
              <div className="h-4 bg-[var(--panel-border)] rounded w-full"></div>
            </div>
          ))}
        </div>

        {/* Table Body Skeleton */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--panel-border)] bg-black/20">
                <th className="p-4 w-24"><div className="h-4 bg-[var(--panel-border)] rounded w-12"></div></th>
                <th className="p-4 w-full"><div className="h-4 bg-[var(--panel-border)] rounded w-32"></div></th>
                <th className="p-4 w-48"><div className="h-4 bg-[var(--panel-border)] rounded w-24 float-right"></div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--panel-border)]">
              {[...Array(10)].map((_, i) => (
                <tr key={i}>
                  <td className="p-4">
                    <div className="h-4 bg-[var(--panel-border)] rounded w-8"></div>
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--panel-border)]"></div>
                    <div className="h-4 bg-[var(--panel-border)] rounded w-32"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-[var(--panel-border)] rounded w-16 float-right"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
