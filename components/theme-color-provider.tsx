'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type ThemeColorContextType = {
  themeColor: string
  setThemeColor: (value: string) => void
}

const ThemeColorContext = createContext<ThemeColorContextType>({
  themeColor: 'primary-blue',
  setThemeColor: () => {},
})

export function ThemeColorProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [themeColor, setThemeColor] = useState('primary-blue')

  useEffect(() => {
    // Carrega a cor salva ao iniciar
    const savedColor = localStorage.getItem('theme-color')
    if (savedColor) {
      setThemeColor(savedColor)
    }
  }, [])

  const updateThemeColor = (color: string) => {
    // Salva a nova cor
    localStorage.setItem('theme-color', color)
    setThemeColor(color)
    
    // NOVA FUNÇÃO: Aplica imediatamente as variáveis CSS
    document.body.classList.remove('primary-blue', 'primary-green', 'primary-purple', 'primary-orange')
    document.body.classList.add(color)
    
    // Aplica as variáveis CSS diretamente
    if (color === 'primary-green') {
      document.documentElement.style.setProperty('--primary', '142.1 76.2% 36.3%')
    } else if (color === 'primary-blue') {
      document.documentElement.style.setProperty('--primary', '221.2 83.2% 53.3%')
    } else if (color === 'primary-purple') {
      document.documentElement.style.setProperty('--primary', '262.1 83.3% 57.8%')
    } else if (color === 'primary-orange') {
      document.documentElement.style.setProperty('--primary', '24.6 95% 53.1%')
    }
    
    // Força um reflow do DOM para aplicar as mudanças
    document.body.style.display = 'none'
    document.body.offsetHeight // Force reflow
    document.body.style.display = ''
    
    console.log('Tema alterado para:', color)
  }

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor: updateThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  )
}

export const useThemeColor = () => useContext(ThemeColorContext)
