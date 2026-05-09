"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  MapPin, 
  Link as LinkIcon, 
  Globe,
  Trophy,
  Star,
  Calendar
} from 'lucide-react'
import EditProfileModal from './EditProfileModal'

export function ProfileSidebar({ user, serializedUser, isOwnProfile, topRank }: { user: any, serializedUser: any, isOwnProfile: boolean, topRank: number }) {
  const { data: session } = useSession()
  
  // Use session data if it's the own profile to provide instant updates after editing
  const displayName = isOwnProfile && session?.user
    ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || 'Anonymous User'
    : (user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Anonymous User')
    
  const displayUsername = isOwnProfile && session?.user?.username 
    ? session.user.username 
    : user.username

  return (
    <div className="space-y-8">
      {/* Identity Card */}
      <div className="flex flex-col items-center md:items-start space-y-4">
        <div className="relative group">
          <img
            src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUsername || 'Anonymous'}`}
            className="w-48 h-48 rounded-3xl border-4 border-[var(--panel-border)] shadow-2xl object-cover transition-transform group-hover:scale-105"
            alt="Avatar"
          />
        </div>
        <div className="text-center md:text-left w-full space-y-2">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <h1 className="text-3xl font-black text-[var(--text-strong)] tracking-tight">
              {displayName}
            </h1>
            {isOwnProfile && (
              <div className="flex-shrink-0">
                <EditProfileModal user={serializedUser} />
              </div>
            )}
          </div>
          <p className="text-[var(--text-muted)] font-medium text-lg">@{displayUsername}</p>
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--panel-border)]/50 rounded-full border border-[var(--panel-border)]">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold text-[var(--text-strong)] tracking-tight">Top Speed Rank: <span className="text-[var(--primary)] ml-1">#{topRank.toLocaleString()}</span></span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-4">
        {user.bio && <p className="text-[var(--text-strong)] font-medium italic leading-relaxed">"{user.bio}"</p>}
      </div>

      {/* Details List */}
      <div className="space-y-3 pt-4 border-t border-[var(--panel-border)]">
        {user.location && (
          <div className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{user.location}</span>
          </div>
        )}
        {user.website && (
          <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
            <LinkIcon className="w-4 h-4" />
            <span className="text-sm font-medium truncate">{user.website.replace(/^https?:\/\//, '')}</span>
          </a>
        )}
        {user.github && (
          <a href={`https://github.com/${user.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium truncate">github.com/{user.github}</span>
          </a>
        )}
        {user.linkedin && (
          <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium truncate">linkedin.com/in/{user.linkedin}</span>
          </a>
        )}
        <div className="flex items-center gap-3 text-[var(--text-muted)] pt-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  )
}

export function StatsDashboard({ 
  user, 
  percentile, 
  avgRank,
  solvedByDifficulty,
  totalByDifficulty
}: { 
  user: any, 
  percentile: number, 
  totalUsers: number,
  avgRank: number,
  solvedByDifficulty: Record<string, number>,
  totalByDifficulty: Record<string, number>
}) {
  const [hoveredDifficulty, setHoveredDifficulty] = useState<string | null>(null)
  
  const totalUniqueCompleted = Object.values(solvedByDifficulty).reduce((a, b) => a + b, 0)
  const grandTotalChallenges = Object.values(totalByDifficulty).reduce((a, b) => a + b, 0) || 1

  // Mapping for display with core difficulty colors
  const difficultyDisplay: Record<string, { label: string, color: string, var: string }> = {
    EASY: { label: "Easy", color: "text-[var(--diff-easy)]", var: "var(--diff-easy)" },
    MEDIUM: { label: "Medium", color: "text-[var(--diff-med)]", var: "var(--diff-med)" },
    HARD: { label: "Hard", color: "text-[var(--diff-hard)]", var: "var(--diff-hard)" },
    SUPER_HARD: { label: "Super Hard", color: "text-[var(--diff-super)]", var: "var(--diff-super)" }
  }

  const currentDisplay = hoveredDifficulty && difficultyDisplay[hoveredDifficulty] ? {
    count: solvedByDifficulty[hoveredDifficulty] || 0,
    total: totalByDifficulty[hoveredDifficulty] || 0,
    label: difficultyDisplay[hoveredDifficulty].label,
    color: difficultyDisplay[hoveredDifficulty].var
  } : {
    count: totalUniqueCompleted,
    total: grandTotalChallenges,
    label: "Completed",
    color: "var(--primary)"
  }

  const currentPercent = Math.min(100, (currentDisplay.count / (currentDisplay.total || 1)) * 100)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Rating Card */}
        <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] p-6 rounded-3xl shadow-xl flex flex-col justify-between group hover:border-[var(--primary)]/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Rating</h3>
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
            <p className="text-2xl font-black text-[var(--text-strong)] tracking-tighter">Coming Soon</p>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs font-bold">
            <span className="text-[var(--text-muted)] uppercase">Avg. WPM Ranking</span>
            <span className="text-[var(--text-strong)] font-mono">#{avgRank.toLocaleString()}</span>
          </div>
        </div>

        {/* Global Top Card */}
        <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] p-6 rounded-3xl shadow-xl flex flex-col justify-between group hover:border-[var(--metric-speed)]/30 transition-all">
          <div>
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Global Top</h3>
              <div className="p-2 bg-[var(--metric-speed)]/10 rounded-lg">
                <Star className="w-4 h-4 text-[var(--metric-speed)]" />
              </div>
            </div>
            <p className="text-4xl font-mono font-black text-[var(--text-strong)] tracking-tighter">{percentile.toFixed(2)}%</p>
          </div>
          <div className="mt-6">
             <div className="w-full h-2 bg-[var(--panel-border)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--hero-from)] to-[var(--hero-to)] transition-all duration-1000" 
                  style={{ width: `${percentile}%` }} 
                />
             </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-[var(--panel-bg)] border border-[var(--panel-border)] p-6 rounded-3xl shadow-xl flex items-center gap-6 group hover:border-[var(--primary)]/30 transition-all">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-[var(--panel-border)]"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke={currentDisplay.color}
                strokeWidth="8"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * currentPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-[var(--text-strong)] font-mono">{currentDisplay.count}</span>
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase">{currentDisplay.label}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
             {Object.keys(difficultyDisplay).map(diff => (
               <div 
                 key={diff}
                 onMouseEnter={() => setHoveredDifficulty(diff)}
                 onMouseLeave={() => setHoveredDifficulty(null)}
                 className={`flex justify-between items-center text-[10px] font-black uppercase transition-all cursor-default ${hoveredDifficulty === diff ? 'scale-105' : 'opacity-70'}`}
               >
                  <span className={difficultyDisplay[diff].color}>{difficultyDisplay[diff].label}</span>
                  <span className="text-[var(--text-strong)]">{solvedByDifficulty[diff] || 0}/{totalByDifficulty[diff] || 0}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
