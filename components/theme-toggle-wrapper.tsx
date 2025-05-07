'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggleWrapper() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  // Detectar tema inicial
  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
      setTheme(savedTheme);
    } catch (e) {
      // Fallback para dark mode
      setTheme('dark');
    }
    setMounted(true);
  }, []);

  // Toggle de tema com manipulação DOM direta
  const toggleTheme = () => {
    try {
      // Inverter o tema atual
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);

      // Salvar no localStorage
      localStorage.setItem('theme', newTheme);

      // Aplicar classes diretamente
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }

      console.log(`[ThemeToggle] Tema alterado para: ${newTheme}`);
    } catch (error) {
      console.error('[ThemeToggle] Erro ao alternar tema:', error);
    }
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center">
        <span className="sr-only">Carregando tema...</span>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-md bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-yellow-300"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-blue-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      )}
    </button>
  );
}
