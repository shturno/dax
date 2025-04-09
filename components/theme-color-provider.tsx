'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeColorContext = createContext({ 
  themeColor: 'primary-blue',
  setThemeColor: (color: string) => {}
})

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState('primary-blue')
  
  useEffect(() => {
    const savedColor = localStorage.getItem('theme-color') || 'primary-blue'
    setThemeColor(savedColor)
  }, [])
  
  const updateThemeColor = (color: string) => {
    setThemeColor(color)
    localStorage.setItem('theme-color', color)
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'))
  }
  
  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor: updateThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  )
}

export const useThemeColor = () => useContext(ThemeColorContext)
