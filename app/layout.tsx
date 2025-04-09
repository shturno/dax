import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeColorProvider } from "@/components/theme-color-provider"
import DynamicWrapper from "@/components/dynamic-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Editor Dashboard",
  description: "Project management dashboard for AI-powered browser editor",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} theme-body`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ThemeColorProvider>
            <DynamicWrapper />
            {children}
          </ThemeColorProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

