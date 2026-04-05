"use client"
import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts'

export default function UserGraphs({ attempts }: { attempts: any[] }) {
  // Sort attempts chronologically
  const sortedAttempts = useMemo(() => {
    return [...attempts].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
  }, [attempts])

  // Build GitHub style contribution data (last 30 days or so, or up to 365)
  // For standard view, let's just do a 12-week grid (84 days)
  const activityMap = useMemo(() => {
    const map = new Map<string, number>()
    attempts.forEach(a => {
      const day = new Date(a.completedAt).toISOString().split('T')[0]
      map.set(day, (map.get(day) || 0) + 1)
    })
    return map
  }, [attempts])

  const activityGrid = useMemo(() => {
    const grid = []
    const today = new Date()
    // Go back ~84 days
    for (let i = 84; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const count = activityMap.get(dateStr) || 0
      grid.push({ date: dateStr, count })
    }
    return grid
  }, [activityMap])

  // Format Recharts data
  const chartData = useMemo(() => {
    return sortedAttempts.map((a, i) => ({
      index: i + 1,
      wpm: a.wpm,
      accuracy: a.accuracy,
      date: new Date(a.completedAt).toLocaleDateString()
    }))
  }, [sortedAttempts])

  const getTileColor = (count: number) => {
    if (count === 0) return 'bg-gray-800 border-gray-700'
    if (count < 3) return 'bg-blue-900 border-blue-800'
    if (count < 6) return 'bg-blue-700 border-blue-600'
    return 'bg-blue-500 border-blue-400 font-bold shadow-[0_0_10px_rgba(59,130,246,0.6)]'
  }

  return (
    <div className="space-y-12">
      {/* Activity Grid */}
      <section className="bg-[var(--panel-bg)] p-8 rounded-2xl border border-[var(--panel-border)] shadow-xl">
        <h3 className="text-xl font-bold text-[var(--text-strong)] mb-6">Recent Activity</h3>
        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
          {activityGrid.map((day, idx) => (
            <div 
              key={idx}
              title={`${day.count} submissions on ${day.date}`}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm border transition-all ${getTileColor(day.count)} hover:ring-2 hover:ring-white`}
            />
          ))}
        </div>
        <div className="flex justify-end items-center gap-2 mt-4 text-xs text-[var(--text-muted)]">
           <span>Less</span>
           <div className={`w-3 h-3 rounded-sm border ${getTileColor(0)}`}/>
           <div className={`w-3 h-3 rounded-sm border ${getTileColor(2)}`}/>
           <div className={`w-3 h-3 rounded-sm border ${getTileColor(4)}`}/>
           <div className={`w-3 h-3 rounded-sm border ${getTileColor(10)}`}/>
           <span>More</span>
        </div>
      </section>

      {/* Progress Charts */}
      {chartData.length > 0 ? (
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-[var(--panel-bg)] p-6 rounded-2xl border border-[var(--panel-border)] shadow-xl">
            <h3 className="text-xl font-bold text-[var(--text-strong)] mb-6">Speed Progression (WPM)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="index" stroke="#4b5563" tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis stroke="#4b5563" tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#03142F', borderColor: '#1E3A8A', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Line type="monotone" dataKey="wpm" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--panel-bg)] p-6 rounded-2xl border border-[var(--panel-border)] shadow-xl">
            <h3 className="text-xl font-bold text-[var(--text-strong)] mb-6">Accuracy Progression (%)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="index" stroke="#4b5563" tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis stroke="#4b5563" tick={{fill: '#9ca3af', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#03142F', borderColor: '#1E3A8A', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      ) : (
        <div className="p-8 text-center text-[var(--text-muted)] bg-[var(--panel-bg)] rounded-xl border border-[var(--panel-border)]">
          Play some games to see your statistical progression.
        </div>
      )}
    </div>
  )
}
