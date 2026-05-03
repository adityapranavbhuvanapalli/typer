import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { ThemeToggle } from './ThemeToggle'
import { NavLinks } from './NavLinks'
import { getEffectiveStreak } from '@/lib/streak'

import prisma from '@/lib/db'
import { getCachedDailyChallenge } from '@/lib/cache'

export async function Navbar() {
  // Fire off independent cache query immediately
  const dailyChallengePromise = getCachedDailyChallenge()
  
  const session = await auth()
  
  let currentStreak = 0
  let lastDailyDate: Date | null = null

  if (session?.user) {
    currentStreak = getEffectiveStreak({
      currentStreak: session.user.currentStreak || 0,
      lastDailyDate: session.user.lastDailyDate || null
    })
    lastDailyDate = session.user.lastDailyDate || null
  }

  // Calculate if the streak is "protected" (completed today)
  const isProtected = lastDailyDate && 
    new Date(lastDailyDate).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
  
  // Highlight orange only if streak > 0 AND it's already protected today
  const showOrange = currentStreak > 0 && !!isProtected;
  
  // Resolve the parallel daily challenge query
  const dailyChallenge = await dailyChallengePromise
  const dailyUrl = dailyChallenge ? `/challenge/${dailyChallenge.id}` : "/challenges"
  
  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b border-[var(--panel-border)] shadow-md bg-[var(--panel-bg)]/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      <Link href="/" className="text-3xl font-black tracking-tighter text-[var(--primary)] hover:text-[var(--text-strong)] transition-colors duration-200">
        typer
        <span className="text-[var(--text-strong)] text-3xl">.com</span>
      </Link>
      
      <div className="flex space-x-8 items-center text-sm tracking-wide">
        <NavLinks />
        
        {session?.user ? (
          <div className="flex items-center space-x-4 pl-4 border-l border-[var(--panel-border)]">
            <Link 
              href={dailyUrl}
              className={`flex items-center justify-center gap-1.5 px-3 py-1 shadow-inner border rounded-full font-bold transition-colors cursor-pointer ${
                showOrange 
                  ? 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30 text-orange-500' 
                  : 'bg-[var(--panel-border)]/30 hover:bg-[var(--panel-border)] border-[var(--panel-border)] text-[var(--text-muted)]'
              }`}
              title={showOrange ? "Streak Protected!" : "Complete today's challenge to protect your streak"}
            >
              <span className={!showOrange ? 'opacity-30 grayscale' : ''}>🔥</span>
              <span>{currentStreak}</span>
            </Link>
            <div className="relative group pb-2 -mb-2">
              <div className="flex items-center space-x-2 hover:bg-[var(--panel-bg)] px-3 py-1.5 rounded-full transition-all cursor-pointer">
                <img src={session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.firstName || 'Anonymous'}`} alt="avatar" className="w-8 h-8 rounded-full border border-blue-500" />
                <span className="text-[var(--text-muted)] font-bold">{session.user.firstName || 'Anonymous'} ▾</span>
              </div>
              
              <div className="absolute right-0 top-full w-48 bg-[var(--panel-bg)] border border-[var(--panel-border)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden translate-y-2 group-hover:translate-y-0">
                <Link href={`/profile/${session.user.id}`} className="block px-4 py-3 text-[var(--text-strong)] hover:bg-[var(--panel-border)]/50 border-b border-[var(--panel-border)] font-medium">
                  My Profile
                </Link>
                <form action={async () => { "use server"; await signOut() }}>
                  <button className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-500/10 font-bold transition-colors">
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <Link href="/login" className="px-6 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 inline-block text-center cursor-pointer">
            Sign In
          </Link>
        )}

        {/* Theme Toggle placed explicitly next to sign in block */}
        <div className="pl-4 border-l border-[var(--panel-border)]/50">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
