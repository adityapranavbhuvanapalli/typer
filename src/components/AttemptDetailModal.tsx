"use client"
import React from 'react'
import { X } from 'lucide-react'
import SubmissionGraph from '@/app/challenge/[id]/SubmissionGraph'

export default function AttemptDetailModal({ attempt, onClose }: { attempt: any, onClose: () => void }) {
  if (!attempt) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[var(--panel-border)] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[var(--text-strong)] tracking-tight">{attempt.challenge.title}</h2>
            <p className="text-sm text-[var(--text-muted)] font-medium">Attempt Analysis • {new Date(attempt.completedAt).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--panel-border)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-strong)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--panel-border)] shadow-sm">
              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-1">Net Speed</p>
              <p className="text-3xl font-black text-[var(--metric-speed)] font-mono">{Math.round(attempt.wpm)} <span className="text-xs font-normal">WPM</span></p>
            </div>
            <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--panel-border)] shadow-sm">
              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-1">True Accuracy</p>
              <p className="text-3xl font-black text-[var(--primary)] font-mono">{attempt.trueAccuracy ? attempt.trueAccuracy.toFixed(1) : attempt.accuracy.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--panel-border)] shadow-sm">
              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-1">Time</p>
              <p className="text-3xl font-black text-[var(--text-strong)] font-mono">{attempt.timeSeconds.toFixed(1)}s</p>
            </div>
            <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--primary)]/20 shadow-sm">
              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-1">Percentile</p>
              <p className="text-3xl font-black text-[var(--primary)] font-mono">
                {attempt.percentile !== undefined ? attempt.percentile.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Graph Section */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-strong)]">Performance Trend</h3>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--panel-border)]/30 px-3 py-1 rounded-full border border-[var(--panel-border)]">Visual Analytics</span>
            </div>
            {attempt.rawLog ? (
              <SubmissionGraph rawLog={attempt.rawLog} />
            ) : (
              <div className="w-full h-48 bg-[var(--panel-bg)]/30 rounded-2xl border border-[var(--panel-border)] flex flex-col items-center justify-center text-[var(--text-muted)] border-dashed">
                <p className="font-bold text-sm">Performance Data Not Available</p>
                <p className="text-xs">Analytics were not recorded for this legacy attempt.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
