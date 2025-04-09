'use client'

import dynamic from 'next/dynamic'

// Move the dynamic import to this client component
const ThemeColorApplier = dynamic(() => import('./theme-color-applier'), { 
  ssr: false 
})

export default function DynamicWrapper() {
  return <ThemeColorApplier />
}
