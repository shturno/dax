'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import useDarkMode from '@/hooks/useDarkMode';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <button onClick={toggleTheme}>{theme === 'dark' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}</button>
  );
}
