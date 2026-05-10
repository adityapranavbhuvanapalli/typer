import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=InvalidVerificationToken", request.url))
  }

  try {
    // 1. Find the token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/login?error=TokenNotFound", request.url))
    }

    // 2. Check if it's expired
    if (new Date() > verificationToken.expires) {
      // Clean up the expired token
      await prisma.verificationToken.delete({ where: { token } })
      return NextResponse.redirect(new URL("/login?error=TokenExpired", request.url))
    }

    // 3. Update the user
    // The identifier is the email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (user) {
      await prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() }
      })
    }

    // 4. Delete the token
    await prisma.verificationToken.delete({
      where: { token }
    })

    // 5. Redirect to login with success
    return NextResponse.redirect(new URL("/login?success=EmailVerified", request.url))

  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.redirect(new URL("/login?error=VerificationFailed", request.url))
  }
}
