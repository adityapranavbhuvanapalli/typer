"use client"
import React, { useMemo } from 'react'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts'

export default function UserGraphs({ 
  activityData, 
  progressionData, 
  totalCompleted 
}: { 
  activityData: { completedAt: string }[], 
  progressionData: { wpm: number, accuracy: number, completedAt: string }[],
  totalCompleted: number 
}) {
  // Sort progression chronologically for the line chart
  const sortedProgression = useMemo(() => {
    return [...progressionData].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
  }, [progressionData])

  // Build GitHub style contribution data (past 365 days)
  const activityMap = useMemo(() => {
    const map = new Map<string, number>()
    activityData.forEach(a => {
      const day = new Date(a.completedAt).toISOString().split('T')[0]
      map.set(day, (map.get(day) || 0) + 1)
    })
    return map
  }, [activityData])

  const activityGrid = useMemo(() => {
    const grid: { date: string, count: number, dayOfWeek: number, month: number }[] = []
    const today = new Date()
    // Go back 365 days for the full year heatmap
    for (let i = 365; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const count = activityMap.get(dateStr) || 0
      grid.push({ date: dateStr, count, dayOfWeek: d.getDay(), month: d.getMonth() })
    }
    return grid
  }, [activityMap])

  const monthLabels = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const labels: { index: number, label: string }[] = []
    let lastMonth = -1
    activityGrid.forEach((day, i) => {
      if (day.month !== lastMonth && i % 7 === 0) {
        labels.push({ index: i, label: months[day.month] })
        lastMonth = day.month
      }
    })
    return labels
  }, [activityGrid])

  // Format Recharts data
  const chartData = useMemo(() => {
    return sortedProgression.map((a, i) => ({
      index: i + 1,
      wpm: a.wpm,
      accuracy: a.accuracy,
      date: new Date(a.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }))
  }, [sortedProgression])

  const getTileColor = (count: number) => {
    if (count === 0) return 'bg-gray-800/30 border-gray-700/30'
    if (count < 3) return 'bg-blue-900/50 border-blue-800/50'
    if (count < 6) return 'bg-blue-700/50 border-blue-600/50'
    return 'bg-blue-500 border-blue-400 font-bold shadow-[0_0_10px_rgba(59,130,246,0.4)]'
  }

  return (
    <div className="space-y-8">
      {/* Progression Card */}
      {chartData.length > 0 && (
        <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] p-8 rounded-3xl shadow-xl">
          <h2 className="text-xl font-black text-[var(--text-strong)] flex items-center gap-3 mb-8">
            <span className="w-2 h-6 bg-[var(--primary)] rounded-full"></span>
            Progression
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Speed</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{fontSize: 10, fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} minTickGap={30} />
                    <YAxis tick={{fontSize: 10, fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: 'var(--primary)' }}
                    />
                    <Area type="monotone" dataKey="wpm" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorWpm)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Accuracy</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{fontSize: 10, fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} minTickGap={30} />
                    <YAxis tick={{fontSize: 10, fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} domain={['auto', 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: 'var(--success)' }}
                    />
                    <Area type="monotone" dataKey="accuracy" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Card */}
      <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] p-8 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-xl font-black text-[var(--text-strong)]">{totalCompleted} submissions</span>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">in the past year</span>
          </div>
          <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-3">
            Activity
            <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-pulse"></span>
          </h3>
        </div>
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[800px]">
            <div className="flex gap-1 mb-2">
              {monthLabels.map((m, i) => (
                <div key={i} className="text-[10px] text-[var(--text-muted)] font-bold uppercase" style={{ marginLeft: i === 0 ? 0 : 'auto' }}>
                  {m.label}
                </div>
              ))}
            </div>
            <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
              {activityGrid.map((day, idx) => (
                <div 
                  key={idx}
                  title={`${day.count} submissions on ${day.date}`}
                  className={`w-3 h-3 rounded-sm border transition-all ${getTileColor(day.count)} hover:ring-2 hover:ring-[var(--primary)]`}
                />
              ))}
            </div>
            <div className="flex justify-end items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
               <span>Less</span>
               <div className={`w-3 h-3 rounded-sm border ${getTileColor(0)}`}/>
               <div className={`w-3 h-3 rounded-sm border ${getTileColor(2)}`}/>
               <div className={`w-3 h-3 rounded-sm border ${getTileColor(4)}`}/>
               <div className={`w-3 h-3 rounded-sm border ${getTileColor(10)}`}/>
               <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
