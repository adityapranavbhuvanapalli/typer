'use client'
import React, { useState } from 'react'
import TypingEngine from '@/components/TypingEngine'
import { submitAttempt } from './actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ChallengeData {
  id: string
  title: string
  difficulty: string
  content: string
}

export default function ChallengeWorkspace({
  challenge,
  isGuest
}: {
  challenge: ChallengeData
  isGuest: boolean
}) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState<{
    wpm: number
    accuracy: number
    timeSeconds: number
    errors: number
  } | null>(null)

  const handleComplete = async (finalStats: {
    wpm: number
    accuracy: number
    timeSeconds: number
    errors: number
  }) => {
    setStats(finalStats)
    setIsCompleted(true)

    if (!isGuest) {
      setIsSaving(true)
      const res = await submitAttempt(challenge.id, finalStats)
      setIsSaving(false)

      if (res.error) {
        alert('CRITICAL ERROR: ' + res.error)
      } else {
        // refresh server components in background to update navbar cache etc if needed
        router.refresh()
      }
    }
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'HARD':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      case 'SUPER_HARD':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      default:
        return 'text-[var(--text-muted)] bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div className="flex w-full flex-col items-center">
      {/* HUD Header */}
      <div className="mb-8 flex w-full max-w-4xl items-center justify-between px-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-strong)]">{challenge.title}</h1>
          <div className="mt-2 text-left">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${getDifficultyColor(challenge.difficulty)}`}
            >
              {challenge.difficulty.replace('_', ' ')}
            </span>
          </div>
        </div>
        {isGuest && (
          <div className="rounded border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm font-semibold text-yellow-500">
            Playing as Guest. Progress will not be saved.
          </div>
        )}
      </div>

      {/* Typing Core */}
      {!isCompleted ? (
        <TypingEngine content={challenge.content} onComplete={handleComplete} />
      ) : (
        <div className="animate-in fade-in zoom-in w-full max-w-2xl space-y-8 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-8 text-center shadow-2xl duration-300">
          <h2 className="text-4xl font-black text-[var(--text-strong)]">Challenge Complete!</h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4">
              <p className="mb-1 text-sm font-semibold text-[var(--text-muted)]">Net WPM</p>
              <p className="text-3xl font-bold text-blue-400">{Math.round(stats!.wpm)}</p>
            </div>
            <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4">
              <p className="mb-1 text-sm font-semibold text-[var(--text-muted)]">Accuracy</p>
              <p className="text-3xl font-bold text-green-400">{stats!.accuracy.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4">
              <p className="mb-1 text-sm font-semibold text-[var(--text-muted)]">Time</p>
              <p className="text-3xl font-bold text-[var(--text-strong)]">
                {stats!.timeSeconds.toFixed(1)}s
              </p>
            </div>
            <div className="rounded-xl border border-red-900/30 bg-[var(--panel-bg)] p-4">
              <p className="mb-1 text-sm font-semibold text-[var(--text-muted)]">Missed Words</p>
              <p className="text-3xl font-bold text-red-500">{stats!.errors}</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border border-gray-800 bg-black px-6 py-3 font-bold text-[var(--text-strong)] transition-colors hover:bg-gray-900"
            >
              Retry
            </button>
            <Link
              href="/challenges"
              className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
            >
              {isSaving ? 'Saving...' : 'Next Problem'}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
