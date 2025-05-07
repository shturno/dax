'use client';

import { useEffect } from 'react';

export default function DynamicWrapper() {
  useEffect(() => {
    // Carrega a cor salva do localStorage
    const savedColor = localStorage.getItem('theme-color') || 'primary-blue';
    console.log('Tema carregado:', savedColor);

    // Remove todas as classes de cores anteriores
    document.body.classList.remove(
      'primary-blue',
      'primary-green',
      'primary-purple',
      'primary-orange'
    );

    // Adiciona a classe do tema salvo
    document.body.classList.add(savedColor);

    // AQUI ESTÁ A MUDANÇA IMPORTANTE - Aplicar as variáveis CSS diretamente
    if (savedColor === 'primary-green') {
      document.documentElement.style.setProperty('--primary', '142.1 76.2% 36.3%');
    } else if (savedColor === 'primary-blue') {
      document.documentElement.style.setProperty('--primary', '221.2 83.2% 53.3%');
    } else if (savedColor === 'primary-purple') {
      document.documentElement.style.setProperty('--primary', '262.1 83.3% 57.8%');
    } else if (savedColor === 'primary-orange') {
      document.documentElement.style.setProperty('--primary', '24.6 95% 53.1%');
    }

    // Aplicar um estilo direto para verificar se está funcionando
    const elements = document.querySelectorAll('button[class*="btn"], button[class*="primary"]');
    if (elements.length > 0) {
      console.log('Encontrei botões para estilizar:', elements.length);

      // Aplicar cores diretamente aos botões para o tema verde
      if (savedColor === 'primary-green') {
        elements.forEach(el => {
          (el as HTMLElement).style.backgroundColor = 'hsl(142.1 76.2% 36.3%)';
          (el as HTMLElement).style.borderColor = 'hsl(142.1 76.2% 36.3%)';
        });
      }
      // Adicionar condições para outras cores...
    }
  }, []);

  return null;
}
