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
      const { name, ...rest } = data
      const user = await prisma.user.create({
        data: { ...rest, firstName, lastName }
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
        const authEmail = rawUsername.includes('@') ? rawUsername : `${rawUsername.toLowerCase().replace(/\s/g, '')}@typer.local`
        
        const user = await prisma.user.findUnique({ where: { email: authEmail } })
        
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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
        session.user.firstName = token.firstName as string | null | undefined
        session.user.lastName = token.lastName as string | null | undefined
      }
      return session
    }
  }
})
