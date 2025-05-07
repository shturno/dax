'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { ThemeColorProvider } from '@/components/theme-color-provider';
import ThemeColorApplier from '@/components/theme-color-applier';
import { Sun, Moon } from 'lucide-react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeColorProvider>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeColorApplier />
          {children}
        </NextThemesProvider>
      </ThemeColorProvider>
    </SessionProvider>
  );
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
