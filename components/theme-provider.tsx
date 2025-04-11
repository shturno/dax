"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="dark"
      value={{
        dark: "dark",
        light: "light",
        system: "system",
      }}
    >
      {children}
    </NextThemesProvider>
  );
}
