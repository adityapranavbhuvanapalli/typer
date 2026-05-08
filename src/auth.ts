import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./lib/db"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Apple from "next-auth/providers/apple"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: {
    ...PrismaAdapter(prisma),
    createUser: async (data: any) => {
      let firstName = null
      let lastName = null
      if (data.name) {
        const parts = data.name.trim().split(/\s+/)
        if (parts.length > 1) {
          lastName = parts.pop() || null
          firstName = parts.join(' ')
        } else {
          firstName = data.name
        }
      }
      
      // Generate a mandatory random username for new SSO users
      const randomHash = Math.random().toString(36).substring(2, 8)
      const baseName = firstName?.toLowerCase().replace(/\s/g, '') || 'user'
      const username = `${baseName}_${randomHash}`

      const user = await prisma.user.create({
        data: { ...data, firstName, lastName, username }
      })
      return user as any
    }
  },
  providers: [
    Google,
    GitHub,
    Apple,
    Facebook,
    // Robust Password Local Login with On-The-Fly Generation
    Credentials({
      name: "Start Typing...", // NextAuth prepends "Sign in with " to this by default
      credentials: {
        username: { label: " ", type: "text", placeholder: "Username / Email" },
        password: { label: " ", type: "password", placeholder: "Password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        
        const rawUsername = credentials.username as string
        const password = credentials.password as string
        
        // Support searching by either username or email
        const user = await prisma.user.findFirst({ 
          where: { 
            OR: [
              { email: rawUsername },
              { username: rawUsername },
              // Legacy support for typer.local (can be removed later)
              { email: rawUsername.includes('@') ? rawUsername : `${rawUsername.toLowerCase().replace(/\s/g, '')}@typer.local` }
            ]
          } 
        })
        
        if (!user) {
          // Explicitly throw so the frontend login panel can intercept and open the Registration Step
          throw new Error("UserNotFound")
        }
        
        // Verify Existing Local User
        if (!user.password) return null // Found user but they used SSO previously
        
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null
        
        return user
      }
    })
  ],
  session: { strategy: "jwt" }, // JWT is easier for serverless + mobile
  pages: {
    signIn: '/login', // Intercept the default ugly page
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.username = (user as any).username
        token.currentStreak = (user as any).currentStreak
        token.lastDailyDate = (user as any).lastDailyDate
      }
      if (trigger === "update" && session) {
         if (session.firstName !== undefined) token.firstName = session.firstName
         if (session.lastName !== undefined) token.lastName = session.lastName
         if (session.username !== undefined) token.username = session.username
      }
      // Optional: Add trigger="update" handling for streak later if needed
      return token
    },
    session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
        session.user.firstName = token.firstName as string | null | undefined
        session.user.lastName = token.lastName as string | null | undefined
        session.user.username = token.username as string | null | undefined
        session.user.currentStreak = token.currentStreak as number | undefined
        session.user.lastDailyDate = token.lastDailyDate as Date | null | undefined
      }
      return session
    }
  }
})
