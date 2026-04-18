import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      firstName?: string | null
      lastName?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    firstName?: string | null
    lastName?: string | null
  }
}
