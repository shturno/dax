'use client'

import { useEffect } from 'react'
import { useThemeColor } from './theme-color-provider'

export default function ThemeColorApplier() {
  const { themeColor } = useThemeColor()
  
  useEffect(() => {
    // Remove all theme classes first
    document.body.classList.remove('primary-blue', 'primary-green', 'primary-purple', 'primary-orange')
    
    // Add the selected theme class
    document.body.classList.add(themeColor)
    
    // For debugging
    console.log('Applied theme color:', themeColor)
  }, [themeColor])
  
  return null
}
