'use client'

// Função para mudar o tema
export function changeThemeColor(color) {
  // Remover todas as classes de cor anteriores
  document.body.classList.remove('primary-blue', 'primary-green', 'primary-purple', 'primary-orange');
  
  // Adicionar a nova classe de cor
  document.body.classList.add(color);
  
  // Salvar preferência no localStorage
  localStorage.setItem('theme-color', color);
  
  console.log('Tema alterado para:', color);
  
  // Também aplica as variáveis CSS diretamente (garante que funcione)
  applyThemeVariables(color);
}

// Função auxiliar para aplicar variáveis CSS
function applyThemeVariables(color) {
  switch(color) {
    case 'primary-green':
      document.documentElement.style.setProperty('--primary', '142.1 76.2% 36.3%');
      document.documentElement.style.setProperty('--primary-foreground', '355.7 100% 97.3%');
      document.documentElement.style.setProperty('--ring', '142.1 76.2% 36.3%');
      break;
    case 'primary-blue':
      document.documentElement.style.setProperty('--primary', '221.2 83.2% 53.3%');
      document.documentElement.style.setProperty('--primary-foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--ring', '221.2 83.2% 53.3%');
      break;
    case 'primary-purple':
      document.documentElement.style.setProperty('--primary', '262.1 83.3% 57.8%');
      document.documentElement.style.setProperty('--primary-foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--ring', '262.1 83.3% 57.8%');
      break;
    case 'primary-orange':
      document.documentElement.style.setProperty('--primary', '24.6 95% 53.1%');
      document.documentElement.style.setProperty('--primary-foreground', '60 9.1% 97.8%');
      document.documentElement.style.setProperty('--ring', '24.6 95% 53.1%');
      break;
  }
}
