// Crie um arquivo em types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extend the session object
   */
  interface Session {
    user: {
      id?: string
    } & DefaultSession["user"]
  }
}