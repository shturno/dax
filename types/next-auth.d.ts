import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extendendo o tipo Session
   */
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
    }
  }

  /**
   * Extendendo o tipo User
   */
  interface User {
    id: string
    username?: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Extendendo o tipo JWT
   */
  interface JWT {
    id: string
    username?: string
  }
}