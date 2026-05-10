"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { registerUser } from './actions'

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !firstName || !lastName) {
      setError("All fields are mandatory.")
      return
    }

    setLoading(true)
    setError("")
    
    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)
    formData.append("firstName", firstName)
    formData.append("lastName", lastName)

    const result = await registerUser(formData)
    
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
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
            {success ? "Check your inbox!" : "Create your account"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
            <p className="text-red-500 text-sm font-bold">{error}</p>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center animate-in slide-in-from-bottom-5 duration-500">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-strong)]">Verify your email</h3>
            <p className="text-[var(--text-muted)] text-md leading-relaxed">
              We've sent a verification link to <br/>
              <span className="font-bold text-[var(--text-strong)]">{email}</span>. <br/><br/>
              Please check your inbox to activate your account.
            </p>
            <Link href="/login" className="mt-8 block w-full bg-[var(--panel-border)] hover:bg-[var(--panel-border)]/80 text-[var(--text-strong)] font-bold py-3.5 rounded-xl transition-all">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 mb-8">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="First Name *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                className="w-1/2 bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-5 py-4 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] disabled:opacity-50 text-sm"
              />
              <input 
                type="text" 
                placeholder="Last Name *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                className="w-1/2 bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-5 py-4 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] disabled:opacity-50 text-sm"
              />
            </div>
            
            <input 
              type="email" 
              placeholder="Email Address *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-5 py-4 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] disabled:opacity-50 text-sm"
            />
            
            <input 
              type="password" 
              placeholder="Password *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-5 py-4 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] disabled:opacity-50 text-sm"
            />

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-[var(--primary)] hover:bg-blue-600 active:scale-95 text-white font-black text-lg py-4 rounded-xl shadow-[0_5px_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-6 text-center">
            <p className="text-[var(--text-muted)] text-sm font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--primary)] hover:underline font-bold">
                Log in here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
