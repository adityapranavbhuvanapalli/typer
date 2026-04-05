import Link from 'next/link'
import Image from 'next/image'
import { auth, signOut } from '@/auth'
import { ThemeToggle } from './ThemeToggle'
import { NavLinks } from './NavLinks'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function Navbar() {
  const session = await auth()

  let currentStreak = 0
  if (session?.user?.id) {
    const userDb = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currentStreak: true }
    })
    currentStreak = userDb?.currentStreak || 0
  }

  const dailyChallenge = await prisma.challenge.findFirst({
    where: { isDaily: true },
    select: { id: true }
  })
  const dailyUrl = dailyChallenge ? `/challenge/${dailyChallenge.id}` : '/challenges'

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--panel-border)] bg-[var(--panel-bg)]/80 px-8 py-4 shadow-md backdrop-blur-md transition-all">
      <Link
        href="/"
        className="text-3xl font-black tracking-tighter text-[var(--primary)] transition-colors duration-200 hover:text-[var(--text-strong)]"
      >
        typer
        <span className="text-3xl text-[var(--text-strong)]">.com</span>
      </Link>

      <div className="flex items-center space-x-8 text-sm tracking-wide">
        <NavLinks />

        {session?.user ? (
          <div className="flex items-center space-x-4 border-l border-[var(--panel-border)] pl-4">
            <Link
              href={dailyUrl}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 py-1 font-bold shadow-inner transition-colors ${
                currentStreak > 0
                  ? 'border-orange-500/30 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
                  : 'border-[var(--panel-border)] bg-[var(--panel-border)]/30 text-[var(--text-muted)] hover:bg-[var(--panel-border)]'
              }`}
              title="Play Daily Challenge"
            >
              <span className={currentStreak === 0 ? 'opacity-30 grayscale' : ''}>🔥</span>
              <span>{currentStreak}</span>
            </Link>
            <div className="group relative -mb-2 pb-2">
              <div className="flex cursor-pointer items-center space-x-2 rounded-full px-3 py-1.5 transition-all hover:bg-[var(--panel-bg)]">
                <Image
                  src={
                    session.user.image ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`
                  }
                  width={32}
                  height={32}
                  alt="avatar"
                  className="h-8 w-8 rounded-full border border-blue-500"
                />
                <span className="font-bold text-[var(--text-muted)]">{session.user.name} ▾</span>
              </div>

              <div className="invisible absolute top-full right-0 z-50 w-48 translate-y-2 overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <Link
                  href={`/profile/${session.user.id}`}
                  className="block border-b border-[var(--panel-border)] px-4 py-3 font-medium text-[var(--text-strong)] hover:bg-[var(--panel-border)]/50"
                >
                  My Profile
                </Link>
                <form
                  action={async () => {
                    'use server'
                    await signOut()
                  }}
                >
                  <button className="w-full px-4 py-3 text-left font-bold text-red-500 transition-colors hover:bg-red-500/10">
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-block transform cursor-pointer rounded-lg bg-[var(--primary)] px-6 py-2 text-center font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] active:translate-y-0"
          >
            Sign In
          </Link>
        )}

        {/* Theme Toggle placed explicitly next to sign in block */}
        <div className="border-l border-[var(--panel-border)]/50 pl-4">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
