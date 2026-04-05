import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Apple from 'next-auth/providers/apple'
import Facebook from 'next-auth/providers/facebook'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    GitHub,
    Apple,
    Facebook,
    // Robust Password Local Login with On-The-Fly Generation
    Credentials({
      name: 'Start Typing...', // NextAuth prepends "Sign in with " to this by default
      credentials: {
        username: { label: ' ', type: 'text', placeholder: 'Username / Email' },
        password: { label: ' ', type: 'password', placeholder: 'Password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const rawUsername = credentials.username as string
        const password = credentials.password as string
        const authEmail = rawUsername.includes('@')
          ? rawUsername
          : `${rawUsername.toLowerCase().replace(/\s/g, '')}@typer.local`

        const user = await prisma.user.findUnique({ where: { email: authEmail } })

        if (!user) {
          // Explicitly throw so the frontend login panel can intercept and open the Registration Step
          throw new Error('UserNotFound')
        }

        // Verify Existing Local User
        const dbPassword = (user as unknown as { password?: string | null }).password
        if (!dbPassword) return null // Found user but they used SSO previously

        const isValid = await bcrypt.compare(password, dbPassword)
        if (!isValid) return null

        return user
      }
    })
  ],
  session: { strategy: 'jwt' }, // JWT is easier for serverless + mobile
  pages: {
    signIn: '/login' // Intercept the default ugly page
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})
