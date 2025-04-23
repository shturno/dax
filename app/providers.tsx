"use client"

import { SessionProvider } from "next-auth/react"
import { NextThemesProvider } from "next-themes"
import { ThemeColorProvider } from "@/components/theme-color-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5}>
      <NextThemesProvider attribute="class">
        <ThemeColorProvider>
          {children}
        </ThemeColorProvider>
      </NextThemesProvider>
    </SessionProvider>
  )
}