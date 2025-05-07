'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { ThemeColorProvider } from '@/components/theme-color-provider';
import { ProjectProvider } from '@/context/ProjectContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5}>
      <ThemeProvider attribute="class">
        <ThemeColorProvider>
          <ProjectProvider>
            {children}
          </ProjectProvider>
        </ThemeColorProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
