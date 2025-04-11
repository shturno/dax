"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import SettingsPage from "@/components/settings-page"
import { ThemeColorProvider } from "@/components/theme-color-provider" // Adicione esta importação

export default function SettingsRoute() {
  return (
    <DashboardLayout>
      <ThemeColorProvider>
        <SettingsPage />
      </ThemeColorProvider>
    </DashboardLayout>
  )
}
