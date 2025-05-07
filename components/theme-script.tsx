'use client';

import { useEffect } from 'react';

export default function ThemeScript() {
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') || 'dark';

      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch (err) {
      console.error('Erro ao aplicar tema:', err);
    }
  }, []);

  return null;
}
