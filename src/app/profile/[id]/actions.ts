"use server"

import prisma from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateProfile(userId: string, formData: FormData) {
  const session = await auth()
  
  if (!session || session.user.id !== userId) {
    return { error: "Unauthorized" }
  }

  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const username = formData.get("username") as string
  const bio = formData.get("bio") as string
  const location = formData.get("location") as string
  let website = formData.get("website") as string
  let linkedin = formData.get("linkedin") as string
  let github = formData.get("github") as string

  // Clean handles: extract username if full URL is provided
  if (github) {
    github = github.replace(/https?:\/\/(www\.)?github\.com\//, "").replace(/\/$/, "")
  }
  if (linkedin) {
    linkedin = linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, "").replace(/\/$/, "")
  }

  if (!firstName || !lastName || !username) {
    return { error: "First Name, Last Name, and Username are mandatory." }
  }

  // Check if username is unique
  const existing = await prisma.user.findFirst({
    where: {
      username,
      NOT: { id: userId }
    }
  })

  if (existing) {
    return { error: "Username is already taken." }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        username,
        bio: bio || null,
        location: location || null,
        website: website || null,
        linkedin: linkedin || null,
        github: github || null,
      }
    })

    revalidatePath(`/profile/${userId}`)
    return { success: true }
  } catch (error) {
    console.error("Profile update failed:", error)
    return { error: "Failed to update profile." }
  }
}
