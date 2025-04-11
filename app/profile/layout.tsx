// Crie um layout específico para a seção de perfil para garantir consistência

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#000] dark:bg-[#000] text-white">
      {children}
      
      {/* Script para garantir tema consistente */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const savedTheme = localStorage.getItem('theme') || 'dark';
              // Forçar tema escuro na seção de perfil
              if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
              }
            })();
          `,
        }}
      />
    </div>
  );
}