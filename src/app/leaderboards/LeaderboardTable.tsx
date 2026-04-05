"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { Zap, Activity, Flame, CalendarDays, Trophy } from 'lucide-react'

// Define the User type we expect
export interface LeaderboardUser {
  id: string
  name: string | null
  image: string | null
  topWpm: number
  averageWpm: number
  totalCompleted: number
  currentStreak: number
  longestStreak: number
}

interface LeaderboardTableProps {
  topWpmUsers: LeaderboardUser[]
  avgWpmUsers: LeaderboardUser[]
  mostCompletedUsers: LeaderboardUser[]
  longestStreakUsers: LeaderboardUser[]
}

type TabType = 'top_speed' | 'avg_speed' | 'solved' | 'streak'

export default function LeaderboardTable({ topWpmUsers, avgWpmUsers, mostCompletedUsers, longestStreakUsers }: LeaderboardTableProps) {
  const [activeTab, setActiveTab] = useState<TabType>('top_speed')
  
  const getActiveData = () => {
    switch(activeTab) {
      case 'top_speed': return topWpmUsers
      case 'avg_speed': return avgWpmUsers
      case 'solved': return mostCompletedUsers
      case 'streak': return longestStreakUsers
      default: return topWpmUsers
    }
  }

  const activeData = getActiveData()

  return (
    <div className="w-full bg-[var(--panel-bg)] rounded-2xl border border-[var(--panel-border)] shadow-xl overflow-hidden">
      
      {/* Tab Header */}
      <div className="flex border-b border-[var(--panel-border)] bg-[var(--panel-bg)]/50 pt-2 px-4 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('top_speed')}
          className={`whitespace-nowrap px-6 py-3 flex items-center gap-2 font-medium text-sm transition-all border-b-2 rounded-tl-lg rounded-tr-lg ${activeTab === 'top_speed' ? 'border-blue-500 text-[var(--metric-speed)] bg-blue-500/10' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--panel-border)]'}`}
        >
          <Zap size={16} /> Top Speed
        </button>
        <button
          onClick={() => setActiveTab('avg_speed')}
          className={`whitespace-nowrap px-6 py-3 flex items-center gap-2 font-medium text-sm transition-all border-b-2 rounded-tl-lg rounded-tr-lg ${activeTab === 'avg_speed' ? 'border-purple-500 text-[var(--metric-avg)] bg-purple-500/10' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--panel-border)]'}`}
        >
          <Activity size={16} /> Avg Speed
        </button>
        <button
          onClick={() => setActiveTab('solved')}
          className={`whitespace-nowrap px-6 py-3 flex items-center gap-2 font-medium text-sm transition-all border-b-2 rounded-tl-lg rounded-tr-lg ${activeTab === 'solved' ? 'border-green-500 text-[var(--metric-solved)] bg-green-500/10' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--panel-border)]'}`}
        >
          <Flame size={16} /> Most Solved
        </button>
        <button
          onClick={() => setActiveTab('streak')}
          className={`whitespace-nowrap px-6 py-3 flex items-center gap-2 font-medium text-sm transition-all border-b-2 rounded-tl-lg rounded-tr-lg ${activeTab === 'streak' ? 'border-orange-500 text-[var(--metric-streak)] bg-orange-500/10' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--panel-border)]'}`}
        >
          <CalendarDays size={16} /> Longest Streaks
        </button>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--panel-border)] text-[var(--text-muted)] text-xs uppercase tracking-wider bg-black/20">
              <th className="p-4 font-medium w-24">Rank</th>
              <th className="p-4 font-medium w-full">User</th>
              {activeTab === 'top_speed' && (
                <th className="p-4 font-medium text-right w-48 whitespace-nowrap">Top Speed</th>
              )}
              {activeTab === 'avg_speed' && (
                <th className="p-4 font-medium text-right w-48 whitespace-nowrap">Avg Speed</th>
              )}
              {activeTab === 'solved' && (
                <th className="p-4 font-medium text-right w-48 whitespace-nowrap">Total Solved</th>
              )}
              {activeTab === 'streak' && (
                <th className="p-4 font-medium text-right w-48 whitespace-nowrap">Longest Streak</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--panel-border)]">
            {activeData.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-[var(--text-muted)] italic">
                  No data available yet.
                </td>
              </tr>
            )}
            {activeData.map((user, i) => (
              <tr key={user.id} className="hover:bg-[var(--panel-border)]/50 transition-colors group">
                <td className="p-4">
                  <span className={`w-12 block font-bold font-mono text-sm ${i < 3 ? 'text-yellow-500 flex items-center gap-2' : 'text-[var(--text-muted)] pl-[22px]'}`}>
                    {i < 3 ? <Trophy size={14} className="inline-block" /> : ''} #{i + 1}
                  </span>
                </td>
                <td className="p-4">
                  <Link href={`/profile/${user.id}`} className="flex items-center gap-3 w-max">
                    <img src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-8 h-8 rounded-full border border-gray-600 group-hover:border-blue-500 transition-colors" alt="" />
                    <span className="font-semibold text-[var(--text-strong)] hover:underline decoration-blue-500 underline-offset-4">{user.name || 'Anonymous'}</span>
                  </Link>
                </td>
                {activeTab === 'top_speed' && (
                  <td className="p-4 font-mono font-bold text-[var(--metric-speed)] text-right whitespace-nowrap">
                    {Math.round(user.topWpm)} WPM
                  </td>
                )}
                {activeTab === 'avg_speed' && (
                  <td className="p-4 font-mono font-bold text-[var(--metric-avg)] text-right whitespace-nowrap">
                    {Math.round(user.averageWpm)} WPM
                  </td>
                )}
                {activeTab === 'solved' && (
                  <td className="p-4 text-[var(--metric-solved)] font-mono font-bold text-right whitespace-nowrap">
                    {user.totalCompleted} <span className="text-[var(--text-muted)] font-sans font-normal text-xs">challenges</span>
                  </td>
                )}
                {activeTab === 'streak' && (
                  <td className="p-4 text-[var(--metric-streak)] font-mono font-bold text-right whitespace-nowrap">
                    {user.longestStreak} <span className="text-[var(--text-muted)] font-sans font-normal text-xs">days</span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
