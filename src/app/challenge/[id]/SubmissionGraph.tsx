"use client"
import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts'

interface KeystrokeEvent {
  t: number;
  k: string;
  v: 'hit' | 'miss' | 'del'
}

interface SubmissionGraphProps {
  rawLog: KeystrokeEvent[];
}

export default function SubmissionGraph({ rawLog }: SubmissionGraphProps) {
  const data = useMemo(() => {
    if (!rawLog || rawLog.length === 0) return []

    const durationMs = rawLog[rawLog.length - 1].t
    const durationSec = Math.ceil(durationMs / 1000)
    
    // Group into 1-second bins
    const bins: { second: number; keys: number; wpm: number; errors: number }[] = []
    
    for (let i = 1; i <= durationSec; i++) {
      // Find keys typed in this second
      const keysInBin = rawLog.filter(e => e.t <= i * 1000 && e.t > (i - 1) * 1000).length
      // Calculate cumulative WPM up to this second
      const cumulativeKeys = rawLog.filter(e => e.t <= i * 1000).length
      const wpm = (cumulativeKeys / 5) / (i / 60)
      
      const errorsInBin = rawLog.filter(e => e.t <= i * 1000 && e.t > (i - 1) * 1000 && e.v === 'miss').length

      bins.push({
        second: i,
        keys: keysInBin,
        wpm: Math.round(wpm),
        errors: errorsInBin
      })
    }

    return bins
  }, [rawLog])

  const errorPoints = useMemo(() => {
    return data.filter(d => d.errors > 0).map(d => ({
      x: d.second,
      y: d.wpm,
      errors: d.errors
    }))
  }, [data])

  if (data.length === 0) return null

  return (
    <div className="w-full h-64 mt-8 bg-[var(--panel-bg)]/30 rounded-2xl border border-[var(--panel-border)] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--panel-border)" opacity={0.5} />
          <XAxis 
            dataKey="second" 
            stroke="var(--text-muted)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => `${val}s`}
          />
          <YAxis 
            stroke="var(--text-muted)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--panel-bg)', 
              borderColor: 'var(--panel-border)',
              borderRadius: '12px',
              color: 'var(--text-strong)'
            }}
            itemStyle={{ color: 'var(--primary)' }}
            cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="wpm" 
            stroke="var(--primary)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorWpm)" 
            animationDuration={1500}
          />
          
          {/* Error markers */}
          {errorPoints.map((point, index) => (
            <ReferenceDot 
              key={index}
              x={point.x} 
              y={point.y} 
              r={4} 
              fill="var(--error)" 
              stroke="none" 
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2 text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
          <span>Speed (WPM)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[var(--error)]" />
          <span>Errors Detected</span>
        </div>
      </div>
    </div>
  )
}
