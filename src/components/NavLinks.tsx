'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks() {
  const pathname = usePathname()

  const links = [
    { href: '/how-to', label: 'How To' },
    { href: '/challenges', label: 'Challenges' },
    { href: '/leaderboards', label: 'Leaderboards' }
  ]

  return (
    <>
      {links.map((link) => {
        // Simple logic for active state: if we are exactly on the page or inside it (e.g. /problems/xyz)
        const isActive =
          pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/')

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`border-b-2 pb-1 transition-all ${
              isActive
                ? 'border-[var(--primary)] font-black text-[var(--primary)]'
                : 'border-transparent font-semibold text-[var(--text-muted)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)]'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </>
  )
}
