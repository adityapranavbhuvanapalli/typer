"use server"

import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

export async function checkUserExists(email: string) {
  const authEmail = email.includes('@') ? email : `${email.toLowerCase().replace(/\s/g, '')}@typer.local`
  const existing = await prisma.user.findUnique({ where: { email: authEmail } })
  return !!existing
}

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  if (!email || !password) {
    return { error: "Email and Password are required." }
  }

  // Double check if account exists just in case
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "This email is already registered." }
  }

  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const bio = formData.get("bio") as string
  const website = formData.get("website") as string
  const linkedin = formData.get("linkedin") as string
  const github = formData.get("github") as string

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: (firstName ? firstName + (lastName ? ' ' + lastName : '') : email.split("@")[0]),
        firstName: firstName || email.split("@")[0], // Fallback to email prefix if skipped
        lastName: lastName || null,
        bio: bio || null,
        website: website || null,
        linkedin: linkedin || null,
        github: github || null,
      }
    })
    return { success: true }
  } catch (error) {
    console.error("Registration failed:", error)
    return { error: "A server error occurred while building your profile." }
  }
}
