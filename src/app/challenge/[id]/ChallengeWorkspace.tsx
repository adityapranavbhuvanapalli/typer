"use client"
import React, { useState } from 'react'
import TypingEngine from '@/components/TypingEngine'
import { submitAttempt } from './actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ChallengeWorkspace({ challenge, isGuest }: { challenge: any, isGuest: boolean }) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState<{ wpm: number, accuracy: number, timeSeconds: number, errors: number } | null>(null)

  const handleComplete = async (finalStats: any) => {
    setStats(finalStats)
    setIsCompleted(true)

    if (!isGuest) {
      setIsSaving(true)
      const res = await submitAttempt(challenge.id, finalStats)
      setIsSaving(false)
      
      if (res.error) {
        alert("CRITICAL ERROR: " + res.error)
      } else {
        // refresh server components in background to update navbar cache etc if needed
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
        <div className="w-full max-w-2xl bg-[var(--panel-bg)] border border-[var(--panel-border)] p-8 rounded-2xl shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-300">
          <h2 className="text-4xl font-black text-[var(--text-strong)]">Challenge Complete!</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--panel-border)]">
              <p className="text-[var(--text-muted)] text-sm font-semibold mb-1">Net WPM</p>
              <p className="text-3xl font-bold text-[var(--metric-speed)]">{Math.round(stats!.wpm)}</p>
            </div>
            <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--panel-border)]">
              <p className="text-[var(--text-muted)] text-sm font-semibold mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-[var(--metric-solved)]">{stats!.accuracy.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--panel-border)]">
              <p className="text-[var(--text-muted)] text-sm font-semibold mb-1">Time</p>
              <p className="text-3xl font-bold text-[var(--text-strong)]">{stats!.timeSeconds.toFixed(1)}s</p>
            </div>
            <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--diff-super)]/30">
              <p className="text-[var(--text-muted)] text-sm font-semibold mb-1">Missed Words</p>
              <p className="text-3xl font-bold text-[var(--diff-super)]">{stats!.errors}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg bg-[var(--panel-bg)] hover:bg-[var(--panel-border)] text-[var(--text-strong)] font-bold border border-[var(--panel-border)] transition-colors"
            >
              Retry
            </button>
            <Link 
              href="/challenges"
              className="px-6 py-3 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-strong)] font-bold shadow-lg transition-all"
            >
              {isSaving ? "Saving..." : "Next Problem"}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
