'use client'

import { useState, useEffect } from 'react'

export function useThemeColor() {
  const [themeColor, setThemeColor] = useState('primary-blue')
  
  useEffect(() => {
    // Load from localStorage if available
    const savedColor = localStorage.getItem('theme-color') || 'primary-blue'
    setThemeColor(savedColor)
    
    // Listen for theme color changes
    const handleStorage = () => {
      const color = localStorage.getItem('theme-color') || 'primary-blue'
      setThemeColor(color)
    }
    
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])
  
  return themeColor
}
