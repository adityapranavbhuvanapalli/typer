"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks() {
  const pathname = usePathname()
  
  const links = [
    { href: "/how-to", label: "How To" },
    { href: "/challenges", label: "Challenges" },
    { href: "/leaderboards", label: "Leaderboards" }
  ]

  return (
    <>
      {links.map(link => {
        // Simple logic for active state: if we are exactly on the page or inside it (e.g. /problems/xyz)
        const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/")
        
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`transition-all pb-1 border-b-2 ${
              isActive 
                ? 'text-[var(--primary)] font-black border-[var(--primary)]' 
                : 'text-[var(--text-muted)] font-semibold border-transparent hover:text-[var(--primary)] hover:border-[var(--primary)]/30'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </>
  )
}
