"use client"
import React, { useState } from 'react'
import AttemptDetailModal from './AttemptDetailModal'

export default function AttemptHistoryList({ attempts }: { attempts: any[] }) {
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null)

  return (
    <>
      <div className="space-y-3">
        {attempts.map((attempt) => (
          <div 
            key={attempt.id} 
            onClick={() => setSelectedAttempt(attempt)}
            className="bg-[var(--panel-bg)] border border-[var(--panel-border)] p-4 px-6 rounded-2xl flex items-center justify-between hover:border-[var(--primary)]/50 transition-all group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-bold text-[var(--text-strong)] truncate group-hover:text-[var(--primary)] transition-colors">{attempt.challenge.title}</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                  attempt.challenge.difficulty === 'EASY' ? 'text-[var(--diff-easy)] border-[var(--diff-easy)]/30 bg-[var(--diff-easy)]/10' :
                  attempt.challenge.difficulty === 'MEDIUM' ? 'text-[var(--diff-med)] border-[var(--diff-med)]/30 bg-[var(--diff-med)]/10' :
                  attempt.challenge.difficulty === 'HARD' ? 'text-[var(--diff-hard)] border-[var(--diff-hard)]/30 bg-[var(--diff-hard)]/10' :
                  'text-[var(--diff-super)] border-[var(--diff-super)]/30 bg-[var(--diff-super)]/10'
                }`}>
                  {attempt.challenge.difficulty.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                {(() => {
                  const date = new Date(attempt.completedAt);
                  const h = date.getUTCHours();
                  const m = date.getUTCMinutes();
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  const displayH = h % 12 || 12;
                  const displayM = m < 10 ? `0${m}` : m;
                  return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()} ${displayH}:${displayM} ${ampm} UTC`;
                })()}
              </p>
            </div>
            <div className="flex items-center gap-8">
               <div className="text-right">
                <p className="text-[10px] text-[var(--metric-speed)] font-black uppercase tracking-tighter">Speed</p>
                <p className="text-lg font-mono font-black text-[var(--text-strong)]">{Math.round(attempt.wpm)} <span className="text-[10px] font-normal text-[var(--text-muted)]">WPM</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[var(--primary)] font-black uppercase tracking-tighter">Accuracy</p>
                <p className="text-lg font-mono font-black text-[var(--text-strong)]">{Math.round(attempt.trueAccuracy || attempt.accuracy)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedAttempt && (
        <AttemptDetailModal 
          attempt={selectedAttempt} 
          onClose={() => setSelectedAttempt(null)} 
        />
      )}
    </>
  )
}
