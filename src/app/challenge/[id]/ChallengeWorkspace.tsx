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
      case 'EASY': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'HARD': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      case 'SUPER_HARD': return 'text-red-500 bg-red-500/10 border-red-500/20'
      default: return 'text-[var(--text-muted)] bg-gray-500/10 border-gray-500/20'
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
          <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded text-sm font-semibold">
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
              <p className="text-3xl font-bold text-blue-400">{Math.round(stats!.wpm)}</p>
            </div>
            <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--panel-border)]">
              <p className="text-[var(--text-muted)] text-sm font-semibold mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-green-400">{stats!.accuracy.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--panel-border)]">
              <p className="text-[var(--text-muted)] text-sm font-semibold mb-1">Time</p>
              <p className="text-3xl font-bold text-[var(--text-strong)]">{stats!.timeSeconds.toFixed(1)}s</p>
            </div>
            <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-red-900/30">
              <p className="text-[var(--text-muted)] text-sm font-semibold mb-1">Missed Words</p>
              <p className="text-3xl font-bold text-red-500">{stats!.errors}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg bg-black hover:bg-gray-900 text-[var(--text-strong)] font-bold border border-gray-800 transition-colors"
            >
              Retry
            </button>
            <Link 
              href="/challenges"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all"
            >
              {isSaving ? "Saving..." : "Next Problem"}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
