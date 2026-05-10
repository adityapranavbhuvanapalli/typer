"use server"

import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import nodemailer from "nodemailer"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  
  if (!email || !password || !firstName || !lastName) {
    return { error: "All fields are mandatory." }
  }

  // Basic email validation
  if (!email.includes("@")) {
    return { error: "Please provide a valid email address." }
  }

  // Check if account already exists
  const existing = await prisma.user.findFirst({ 
    where: { 
      OR: [
        { email },
        { username: email } // In case they typed a username into the email field
      ]
    } 
  })
  
  if (existing) {
    return { error: "An account with this email already exists." }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Generate a mandatory random username
  const randomHash = Math.random().toString(36).substring(2, 8)
  const baseName = firstName.toLowerCase().replace(/\s/g, '')
  const username = `${baseName}_${randomHash}`

  try {
    // 1. Create the User (unverified)
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        // emailVerified is omitted so it stays null
      }
    })

    // 2. Generate a Verification Token
    const token = randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // Token expires in 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    })

    // 3. Send Verification Email using Nodemailer
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const verifyUrl = `${baseUrl}/verify?token=${token}`
    
    // Check if SMTP is configured
    if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      })

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Typer" <noreply@typer.com>',
        to: email,
        subject: "Verify your Typer Account",
        text: `Welcome to Typer! Please verify your account by clicking the following link: ${verifyUrl}`,
        html: `<p>Welcome to Typer!</p><p>Please verify your account by clicking the link below:</p><p><a href="${verifyUrl}">Verify Account</a></p>`,
      })
    } else {
      console.warn("⚠️ SMTP credentials not found. Verification email bypassed. Token URL:", verifyUrl)
      // We still return success so the user isn't blocked if the owner hasn't set up SMTP yet
    }

    return { success: true }
  } catch (error) {
    console.error("Registration failed:", error)
    return { error: "A server error occurred while creating your profile." }
  }
}

export async function resendVerificationEmail(email: string) {
  if (!email) return { error: "Email is required." }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) return { error: "User not found." }
    if (user.emailVerified) return { error: "Account is already verified." }

    // Delete any existing tokens for this user to prevent clutter
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    // Generate a new token
    const token = randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 24)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const verifyUrl = `${baseUrl}/verify?token=${token}`
    
    // Send email
    if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      })

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Typer" <noreply@typer.com>',
        to: email,
        subject: "Verify your Typer Account",
        text: `Please verify your account by clicking the following link: ${verifyUrl}`,
        html: `<p>Please verify your account by clicking the link below:</p><p><a href="${verifyUrl}">Verify Account</a></p>`,
      })
    } else {
      console.warn("⚠️ SMTP missing. Resend token URL:", verifyUrl)
    }

    return { success: true }
  } catch (error) {
    console.error("Resend error:", error)
    return { error: "Failed to resend email." }
  }
}

export async function updatePassword(formData: FormData) {
  const { auth } = await import("@/auth")
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in again." }
  }

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required." }
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." }
  }

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters long." }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })

    if (!user || !user.password) {
      return { error: "This account was created via social login and does not have a password. Please use your social provider to sign in." }
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return { error: "Current password is incorrect." }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword }
    })

    return { success: true }
  } catch (error) {
    console.error("Password update error:", error)
    return { error: "A server error occurred. Please try again." }
  }
}
