"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeColorProvider } from "@/components/theme-color-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeColorProvider>
        {children}
      </ThemeColorProvider>
    </SessionProvider>
  )
}