"use client"
import React, { useState } from 'react'
import TypingEngine from '@/components/TypingEngine'
import { submitAttempt } from './actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SubmissionGraph from './SubmissionGraph'

export default function ChallengeWorkspace({ challenge, isGuest }: { challenge: any, isGuest: boolean }) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState<{ 
    wpm: number, 
    timeSeconds: number, 
    errors: number,
    rawLog: any[],
    trueAccuracy: number,
    percentile?: number
  } | null>(null)

  const handleComplete = async (finalStats: any) => {
    setStats(finalStats)
    setIsCompleted(true)

    if (!isGuest) {
      setIsSaving(true)
      const res = await submitAttempt(challenge.id, finalStats)
      setIsSaving(false)
      
      if (res.error) {
        alert("CRITICAL ERROR: " + res.error)
      } else if (res.percentile !== undefined) {
        setStats(prev => prev ? { ...prev, percentile: res.percentile } : null)
        router.refresh()
      } else {
        router.refresh()
      }
    }
  }

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'EASY': return 'text-[var(--diff-easy)] bg-[var(--diff-easy)]/10 border-[var(--diff-easy)]/20'
      case 'MEDIUM': return 'text-[var(--diff-med)] bg-[var(--diff-med)]/10 border-[var(--diff-med)]/20'
      case 'HARD': return 'text-[var(--diff-hard)] bg-[var(--diff-hard)]/10 border-[var(--diff-hard)]/20'
      case 'SUPER_HARD': return 'text-[var(--diff-super)] bg-[var(--diff-super)]/10 border-[var(--diff-super)]/20'
      default: return 'text-[var(--text-muted)] bg-[var(--panel-border)]/10 border-[var(--panel-border)]/20'
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* HUD Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-strong)]">{challenge.title}</h1>
          <div className="mt-2 text-left">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty.replace('_', ' ')}
            </span>
          </div>
        </div>
        {isGuest && (
          <div className="px-3 py-1 bg-[var(--diff-med)]/10 border border-[var(--diff-med)]/30 text-[var(--diff-med)] rounded text-sm font-semibold">
            Playing as Guest. Progress will not be saved.
          </div>
        )}
      </div>

      {/* Typing Core */}
      {!isCompleted ? (
        <TypingEngine content={challenge.content} onComplete={handleComplete} />
      ) : (
        <div className="w-full max-w-4xl bg-[var(--panel-bg)] border border-[var(--panel-border)] p-10 rounded-3xl shadow-2xl text-center space-y-10 animate-in fade-in zoom-in duration-500">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-[var(--text-strong)] tracking-tighter">Challenge Complete!</h2>
            <p className="text-[var(--text-muted)] font-medium">Detailed performance breakdown</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-[var(--panel-bg)] rounded-2xl border border-[var(--panel-border)] shadow-sm hover:border-[var(--primary)]/30 transition-all">
              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-2">Net Speed</p>
              <p className="text-4xl font-black text-[var(--metric-speed)] font-mono">{Math.round(stats!.wpm)} <span className="text-xs font-normal">WPM</span></p>
            </div>
            <div className="p-6 bg-[var(--panel-bg)] rounded-2xl border border-[var(--panel-border)] shadow-sm hover:border-[var(--primary)]/30 transition-all">
              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-2">True Accuracy</p>
              <p className="text-4xl font-black text-[var(--primary)] font-mono">{stats!.trueAccuracy.toFixed(1)}%</p>
            </div>
            <div className="p-6 bg-[var(--panel-bg)] rounded-2xl border border-[var(--panel-border)] shadow-sm hover:border-[var(--primary)]/30 transition-all">
              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-2">Time Elapsed</p>
              <p className="text-4xl font-black text-[var(--text-strong)] font-mono">{stats!.timeSeconds.toFixed(1)}s</p>
            </div>
            <div className="p-6 bg-[var(--panel-bg)] rounded-2xl border border-[var(--primary)]/20 shadow-sm hover:border-[var(--primary)] transition-all">
              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-2">Percentile</p>
              <p className="text-4xl font-black text-[var(--primary)] font-mono">
                {stats!.percentile !== undefined ? stats!.percentile.toFixed(1) : '...'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--text-strong)]">Session Performance</h3>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--panel-border)]/30 px-3 py-1 rounded-full border border-[var(--panel-border)]">Real-time Analysis</span>
            </div>
            <SubmissionGraph rawLog={stats!.rawLog} />
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              disabled={isSaving}
              className={`px-6 py-3 rounded-lg font-bold border transition-colors ${
                isSaving 
                  ? "bg-[var(--panel-bg)] text-[var(--text-muted)] border-[var(--panel-border)] cursor-not-allowed opacity-50" 
                  : "bg-[var(--panel-bg)] hover:bg-[var(--panel-border)] text-[var(--text-strong)] border-[var(--panel-border)]"
              }`}
            >
              Retry
            </button>
            <Link 
              href={isSaving ? "#" : "/challenges"}
              onClick={(e) => isSaving && e.preventDefault()}
              className={`px-6 py-3 rounded-lg font-bold shadow-lg transition-all ${
                isSaving 
                  ? "bg-[var(--primary)]/50 text-[var(--text-strong)]/50 cursor-not-allowed pointer-events-none" 
                  : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-strong)]"
              }`}
            >
              {isSaving ? "Saving..." : "Next Problem"}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
