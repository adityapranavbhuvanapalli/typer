"use client"

import React, { useState } from 'react'
import { updateProfile } from './actions'
import { useSession } from 'next-auth/react'

export default function EditProfileModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { update } = useSession()

  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    username: user.username || "",
    bio: user.bio || "",
    website: user.website || "",
    linkedin: user.linkedin || "",
    github: user.github || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value)
    })

    const result = await updateProfile(user.id, data)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Update session client-side
      await update({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username
      })
      setIsOpen(false)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[var(--panel-border)]/50 hover:bg-[var(--panel-border)] text-[var(--text-strong)] text-sm font-bold rounded-lg transition-all border border-[var(--panel-border)]"
      >
        Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-xl bg-[var(--panel-bg)] border border-[var(--panel-border)] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-[var(--panel-border)] flex justify-between items-center">
              <h2 className="text-xl font-black text-[var(--text-strong)]">Edit Profile</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[var(--panel-border)] rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-bold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-[var(--panel-border)]/20 border border-[var(--panel-border)] rounded-xl px-4 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-[var(--panel-border)]/20 border border-[var(--panel-border)] rounded-xl px-4 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Username *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)] font-bold">@</span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-[var(--panel-border)]/20 border border-[var(--panel-border)] rounded-xl pl-9 pr-4 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-[var(--panel-border)]/20 border border-[var(--panel-border)] rounded-xl px-4 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full bg-[var(--panel-border)]/20 border border-[var(--panel-border)] rounded-xl px-4 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">LinkedIn</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full bg-[var(--panel-border)]/20 border border-[var(--panel-border)] rounded-xl px-4 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">GitHub</label>
                <input
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  className="w-full bg-[var(--panel-border)]/20 border border-[var(--panel-border)] rounded-xl px-4 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm"
                />
              </div>

              <div className="pt-6 border-t border-[var(--panel-border)] flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-6 py-3 bg-transparent hover:bg-[var(--panel-border)] text-[var(--text-muted)] font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[var(--primary)] hover:bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
