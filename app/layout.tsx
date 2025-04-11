import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SaaS Dashboard",
  description: "Project management dashboard for SaaS applications created by @shturno",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
          (function() {
            try {
              const savedTheme = localStorage.getItem('theme') || 'dark';
              document.documentElement.classList.toggle('dark', savedTheme === 'dark');
              document.documentElement.style.colorScheme = savedTheme;
            } catch (e) {
              console.error('Failed to apply theme:', e);
            }
          })();
          `}
        </Script>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
