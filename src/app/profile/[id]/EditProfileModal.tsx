"use client"

import React, { useState, useEffect } from 'react'
import { updateProfile } from './actions'
import { updatePassword } from '@/app/register/actions'
import { useSession } from 'next-auth/react'
import { Pencil, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EditProfileModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { update } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    username: user.username || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    linkedin: user.linkedin || "",
    github: user.github || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  // Ensure form data is updated if user prop changes (e.g. after a successful update)
  useEffect(() => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
      linkedin: user.linkedin || "",
      github: user.github || "",
    })
  }, [user])

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
      
      setLoading(false)
      setIsOpen(false)
      // Redirect to the potentially new username URL
      router.push(`/profile/${formData.username}`)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-[var(--panel-border)]/50 hover:bg-[var(--panel-border)] text-[var(--text-strong)] rounded-lg transition-all border border-[var(--panel-border)] flex items-center justify-center"
        title="Edit Profile"
      >
        <Pencil className="w-4 h-4" />
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

              {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  Profile updated! Refreshing...
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
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full bg-[var(--panel-border)]/10 border border-[var(--panel-border)] rounded-xl px-4 py-3 text-[var(--text-muted)] cursor-not-allowed opacity-70 text-sm"
                  title="Your email address cannot be changed."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-[var(--panel-border)]/20 border border-[var(--panel-border)] rounded-xl px-4 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-none text-sm"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-[var(--panel-border)]/20 border border-[var(--panel-border)] rounded-xl px-4 py-3 text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm"
                    placeholder="e.g. New York, USA"
                  />
                </div>
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
                    placeholder="Username or URL"
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
                  placeholder="Username or URL"
                />
              </div>

              {/* Security Section */}
              <div className="pt-6 border-t border-[var(--panel-border)] space-y-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="w-full flex items-center justify-between p-4 bg-[var(--panel-border)]/20 hover:bg-[var(--panel-border)]/40 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-[var(--text-strong)] uppercase tracking-tighter">Security & Password</p>
                      <p className="text-xs text-[var(--text-muted)] font-medium">Update your account credentials</p>
                    </div>
                  </div>
                  <span className={`text-[var(--text-muted)] transition-transform duration-300 ${showPasswordSection ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showPasswordSection && (
                  <div className="space-y-4 p-4 border border-[var(--panel-border)] rounded-2xl bg-[var(--panel-border)]/5 animate-in slide-in-from-top-4 duration-300">
                    {passwordError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-bold">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-xs font-bold">
                        Password updated successfully!
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPass ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full bg-[var(--panel-bg)] border border-[var(--panel-border)] rounded-xl pl-4 pr-10 py-3 text-sm text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="••••••••"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-strong)]"
                          >
                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">New Password</label>
                          <div className="relative">
                            <input
                              type={showNewPass ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              className="w-full bg-[var(--panel-bg)] border border-[var(--panel-border)] rounded-xl pl-4 pr-10 py-3 text-sm text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              placeholder="Min 8 chars"
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowNewPass(!showNewPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-strong)]"
                            >
                              {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Confirm New</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full bg-[var(--panel-bg)] border border-[var(--panel-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          setPasswordLoading(true)
                          setPasswordError("")
                          setPasswordSuccess(false)
                          
                          const pData = new FormData()
                          pData.append("currentPassword", passwordData.currentPassword)
                          pData.append("newPassword", passwordData.newPassword)
                          pData.append("confirmPassword", passwordData.confirmPassword)
                          
                          const res = await updatePassword(pData)
                          
                          if (res.error) {
                            setPasswordError(res.error)
                            setPasswordLoading(false)
                          } else {
                            setPasswordSuccess(true)
                            setPasswordLoading(false)
                            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                            setTimeout(() => setPasswordSuccess(false), 3000)
                          }
                        }}
                        disabled={passwordLoading}
                        className="w-full py-3 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white font-black rounded-xl border border-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4" />
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>
                )}
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
