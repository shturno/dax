// Utilitário para manipular o tema diretamente

export function getCurrentTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
  }
  return 'dark'; // Padrão para SSR
}

export function setTheme(theme: 'light' | 'dark'): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }
}

export function toggleTheme(): 'light' | 'dark' {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
}
