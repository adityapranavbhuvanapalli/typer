"use client"

import React, { useState } from 'react'
import { signIn } from "next-auth/react"
import Link from 'next/link'
import { registerUser, checkUserExists } from './actions'

export default function CustomLoginPage() {
  const [step, setStep] = useState(1)
  
  // Login State
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Profile Expansion State
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [github, setGithub] = useState("")

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError("Please provide both Username and Password.")
      return
    }
    
    setLoading(true)
    setError("")
    
    // Explicitly check DB to differentiate an Invalid Password from an unregistered user!
    const userExists = await checkUserExists(username)
    
    if (!userExists) {
      // User is completely new safely locally bypass to Step 2
      setStep(2)
      setLoading(false)
      return
    }
    
    // They safely exist, proceed with native formal credential check
    const res = await signIn("credentials", { username, password, redirect: false })
    
    if (res?.error) {
      setError("Invalid Email or Password. Please double check and try again.")
      setLoading(false)
    } else {
      window.location.href = "/"
    }
  }

  const handleFormalRegistration = async (useDefaults: boolean) => {
    setLoading(true)
    setError("")
    
    const formData = new FormData()
    const authEmail = username.includes('@') ? username : `${username.toLowerCase().replace(/\\s/g, '')}@typer.local`
    formData.append("email", authEmail)
    formData.append("password", password) // Still safely held in React memory
    
    if (!useDefaults) {
      formData.append("firstName", firstName)
      formData.append("lastName", lastName)
      formData.append("bio", bio)
      formData.append("website", website)
      formData.append("linkedin", linkedin)
      formData.append("github", github)
    }

    const result = await registerUser(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Server-action created DB profile! Instantly log them in silently natively.
    await signIn("credentials", { username: authEmail, password, callbackUrl: "/" })
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
            {step === 1 ? "Log in or quickly create your profile!" : "Complete your public profile details"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
            <p className="text-red-500 text-sm font-bold">{error}</p>
          </div>
        )}

        {step === 1 ? (
          <>
            <form onSubmit={handleInitialSubmit} className="space-y-4 mb-8">
              <div>
                <input 
                  type="text" 
                  placeholder="Username or Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-5 py-4 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] disabled:opacity-50"
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Password"
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
              <button onClick={() => signIn('google')} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-gray-800 hover:bg-gray-100 transition-all shadow-sm border border-gray-200">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                  <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/>
                </svg>
              </button>
              <button onClick={() => signIn('github')} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#24292F] text-white hover:bg-gray-900 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.1)] border border-[#24292F]">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.379.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </button>
              <button onClick={() => signIn('apple')} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black text-white hover:bg-gray-900 transition-all border border-gray-800 shadow-sm">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.84 1.14.03 2.11.45 2.78 1.12-2.4 1.4-2.04 4.54.4 5.54-1.12 3.1-2.92 5.09-4.76 6.35zm-2.97-15.02c.04-1.92-1.39-3.41-3.26-3.52-.3 2.06 1.35 3.75 3.26 3.52z"/>
                </svg>
              </button>
              <button onClick={() => signIn('facebook')} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#1877F2] text-white hover:bg-[#166fe5] transition-all shadow-[0_5px_15px_rgba(24,119,242,0.2)] border border-[#1877F2]">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-right-10 duration-500">
            <h3 className="font-bold text-[var(--text-strong)] mb-4 pb-2 border-b border-[var(--panel-border)] border-dashed text-lg shadow-sm">
              Almost there, <span className="text-[var(--primary)]">{username}</span>!
            </h3>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                className="w-1/2 bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-4 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] text-sm"
              />
              <input 
                type="text" 
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                className="w-1/2 bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-4 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] text-sm"
              />
            </div>
            <input 
              type="text" 
              placeholder="Short Bio (Optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={loading}
              className="w-full bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-5 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] text-sm"
            />
            <input 
              type="text" 
              placeholder="Personal Website (Optional)"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={loading}
              className="w-full bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-5 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] text-sm"
            />
            <input 
              type="text" 
              placeholder="LinkedIn Profile (Optional)"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              disabled={loading}
              className="w-full bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-5 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] text-sm"
            />
            <input 
              type="text" 
              placeholder="GitHub Profile (Optional)"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              disabled={loading}
              className="w-full bg-[var(--panel-border)]/30 border border-[var(--panel-border)] rounded-xl px-5 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium placeholder-[var(--text-muted)] text-sm"
            />

            <div className="pt-4 space-y-3">
              <button 
                onClick={() => handleFormalRegistration(false)}
                disabled={loading}
                className="w-full bg-[var(--primary)] hover:bg-blue-600 active:scale-95 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? "Creating Profile..." : "Complete Profile & Start Typing"}
              </button>
              <button 
                onClick={() => handleFormalRegistration(true)}
                disabled={loading}
                className="w-full bg-transparent hover:bg-[var(--panel-border)] border border-[var(--panel-border)] active:scale-95 text-[var(--text-muted)] font-bold py-3 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
              >
                Skip & Use Defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
