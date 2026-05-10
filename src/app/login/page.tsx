"use client"

import React, { useState } from 'react'
import { signIn } from "next-auth/react"
import Link from 'next/link'
import { registerUser, checkUserExists } from './actions'

export default function CustomLoginPage() {
  // Login State
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError("Please provide both Username and Password.")
      return
    }
    
    setLoading(true)
    setError("")
    
    // Proceed with native formal credential check
    const res = await signIn("credentials", { username, password, redirect: false })
    
    if (res?.error) {
      if (res.error === "UserNotFound" || res.error === "CredentialsSignin") {
        setError("Invalid Email/Username or Password. Please try again.")
      } else {
        setError(res.error) // Could be "Please verify your email" later!
      }
      setLoading(false)
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 pb-24 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-[var(--panel-bg)]/80 backdrop-blur-2xl border border-[var(--panel-border)] p-10 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2 mb-10">
          <Link href="/" className="inline-block text-4xl font-black tracking-tighter text-[var(--primary)] mb-2">
            typer<span className="text-[var(--text-strong)]">.com</span>
          </Link>
          <p className="text-[var(--text-muted)] text-sm font-medium">
            Log in to your account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
            <p className="text-red-500 text-sm font-bold">{error}</p>
          </div>
        )}

          <form onSubmit={handleInitialSubmit} className="space-y-4 mb-8">
              <div>
                <input 
                  type="text" 
                  placeholder="Username or Email *"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-5 py-4 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] disabled:opacity-50"
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Password *"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-5 py-4 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] disabled:opacity-50"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-2 bg-[var(--primary)] hover:bg-blue-600 active:scale-95 text-white font-black text-lg py-4 rounded-xl shadow-[0_5px_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? "Authenticating..." : "Start Typing..."}
              </button>
            </form>

            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--panel-border)]"></div></div>
              <span className="relative bg-[var(--panel-bg)] px-4 text-xs font-bold text-[var(--text-muted)] tracking-widest uppercase">Or Continue With</span>
            </div>

            <div className="flex justify-center items-center gap-4">
              <button onClick={() => signIn('github')} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#24292F] text-white hover:bg-gray-900 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.1)] border border-[#24292F]" title="Continue with GitHub">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.379.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[var(--text-muted)] text-sm font-medium">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-[var(--primary)] hover:underline font-bold">
                  Sign up here
                </Link>
              </p>
            </div>
      </div>
    </div>
  )
}
