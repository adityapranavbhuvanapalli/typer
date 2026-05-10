"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { resendVerificationEmail } from "@/app/register/actions"

export default function BannerClient({ email }: { email: string }) {
  const [hidden, setHidden] = useState(false)
  const [loading, setLoading] = useState(false)
  const { update } = useSession()

  const handleResend = async () => {
    setLoading(true)
    const result = await resendVerificationEmail(email)
    setLoading(false)

    if (result.error) {
      alert(result.error)
    } else {
      alert("A new verification link has been sent to your email!")
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    // NextAuth update() fetches the latest session from the server
    await update()
    setLoading(false)
  }

  if (hidden) return null

  return (
    <div className="w-full bg-orange-500/10 border-b border-orange-500/20 px-4 py-3 flex items-center justify-between text-sm shadow-sm relative z-50 animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-3">
        <div className="bg-orange-500/20 p-1.5 rounded-full text-orange-400">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-orange-500 font-medium">
          <span className="font-bold">Action Required:</span> Please verify your email address. Unverified accounts will be deleted 30 days after registration.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 pr-4 border-r border-orange-500/20">
          <button 
            onClick={handleResend}
            disabled={loading}
            className="text-orange-400 hover:text-orange-300 font-bold hover:underline disabled:opacity-50 transition-all"
          >
            {loading ? "..." : "Resend Email"}
          </button>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-bold transition-all border border-orange-500/30"
          >
            {loading ? "Checking..." : "I've Verified"}
          </button>
        </div>
        <button 
          onClick={() => setHidden(true)}
          className="text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
