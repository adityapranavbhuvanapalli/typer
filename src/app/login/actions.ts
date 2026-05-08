"use server"

import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

export async function checkUserExists(identifier: string) {
  // Check if identifier is an email or username
  const existing = await prisma.user.findFirst({ 
    where: { 
      OR: [
        { email: identifier },
        { username: identifier },
        { email: identifier.includes('@') ? identifier : `${identifier.toLowerCase().replace(/\s/g, '')}@typer.local` }
      ]
    } 
  })
  return !!existing
}

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  
  if (!email || !password) {
    return { error: "Email and Password are required." }
  }

  if (!firstName || !lastName) {
    return { error: "First Name and Last Name are mandatory." }
  }

  // Double check if account exists
  const existing = await prisma.user.findFirst({ 
    where: { 
      OR: [
        { email },
        // Since we are creating a new user, we don't know their username yet, 
        // but we should check if the identifier they used (which might be an email) exists.
      ]
    } 
  })
  
  if (existing) {
    return { error: "An account with this email/username already exists." }
  }

  const bio = formData.get("bio") as string
  const website = formData.get("website") as string
  const linkedin = formData.get("linkedin") as string
  const github = formData.get("github") as string

  const hashedPassword = await bcrypt.hash(password, 10)

  // Generate a mandatory random username
  const randomHash = Math.random().toString(36).substring(2, 8)
  const baseName = firstName.toLowerCase().replace(/\s/g, '')
  const username = `${baseName}_${randomHash}`

  try {
    await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
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
