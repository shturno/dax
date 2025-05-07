'use client';

import { useEffect } from 'react';
import { useThemeColor } from './theme-color-provider';

export default function ThemeColorApplier() {
  const { color } = useThemeColor();

  useEffect(() => {
    if (!color) return;
    
    try {
      // Remove all theme classes first
      document.documentElement.classList.remove(
        'theme-default',
        'theme-blue',
        'theme-green',
        'theme-purple',
        'theme-orange'
      );

      // Add the selected theme class
      document.documentElement.classList.add(`theme-${color}`);

      // For debugging
      console.log('Applied theme color to HTML element:', color);
    } catch (error) {
      console.error('Error applying theme color:', error);
    }
  }, [color]);

  return null;
}
