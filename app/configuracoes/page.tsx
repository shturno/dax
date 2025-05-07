'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { ProjectSettingsPage } from './ProjectSettingsPage.client';
import { ThemeColorProvider } from '@/components/theme-color-provider';

export default function SettingsRoute() {
  return (
    <DashboardLayout>
      <ThemeColorProvider>
        <ProjectSettingsPage />
      </ThemeColorProvider>
    </DashboardLayout>
  );
}
