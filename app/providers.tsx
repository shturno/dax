'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { ThemeColorProvider } from '@/components/theme-color-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5}>
      <ThemeProvider attribute="class">
        <ThemeColorProvider>{children}</ThemeColorProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
