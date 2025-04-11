import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { MongoClient, ObjectId } from "mongodb";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

interface UserProfile {
  _id: ObjectId;
  username: string;
  email: string;
  password?: string;
  settings?: {
    projectName?: string;
    projectDescription?: string;
    notifications?: boolean;
    autoSave?: boolean;
    fontSize?: number;
    primaryColor?: string;
  };
}

async function fetchProfileData(): Promise<UserProfile | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }
  
  let client = null;
  try {
    client = await new MongoClient(process.env.MONGODB_URI!).connect();
    const db = client.db('saas-dashboard');
    const user = await db.collection('users').findOne({ email: session.user.email.toLowerCase() });
    
    return user ? { ...user, password: undefined } as UserProfile : null;
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  } finally {
    if (client) await client.close();
  }
}

export default async function ProfilePage() {
  const profileData = await fetchProfileData();
  
  if (!profileData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-center text-gray-900">Acesso Negado</h3>
          <p className="mt-2 text-sm text-center text-gray-500">
            Você precisa estar logado para ver esta página.
          </p>
          <div className="mt-6">
            <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#000]">
      <header className="bg-[#000] border-b border-zinc-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Perfil do Usuário</h1>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link 
              href="/profile/edit" 
              className="inline-flex items-center px-4 py-2 border border-zinc-800 rounded-md text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800"
            >
              Editar Perfil
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-zinc-800 sm:px-6">
                <h3 className="text-lg font-medium text-white">Informações Pessoais</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-400">username</dt>
                    <dd className="mt-1 text-sm text-white">{profileData.username}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400">email</dt>
                    <dd className="mt-1 text-sm text-white">{profileData.email}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-zinc-800 sm:px-6">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Notificações</dt>
                    <dd className="mt-1 flex items-center">
                      <span className={`inline-block h-4 w-4 rounded-full ${profileData.settings?.notifications ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                      <span className="ml-2 text-sm text-white">
                        {profileData.settings?.notifications ? 'Ativadas' : 'Desativadas'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Auto Save</dt>
                    <dd className="mt-1 flex items-center">
                      <span className={`inline-block h-4 w-4 rounded-full ${profileData.settings?.autoSave ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                      <span className="ml-2 text-sm text-white">
                        {profileData.settings?.autoSave ? 'Ativado' : 'Desativado'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Tamanho da Fonte</dt>
                    <dd className="mt-1 text-sm text-white">
                      {profileData.settings?.fontSize || 16}px
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Cor Primária</dt>
                    <dd className="mt-1 text-sm text-white flex items-center">
                      <span 
                        className="inline-block h-4 w-4 rounded-full mr-2" 
                        style={{backgroundColor: 
                          profileData.settings?.primaryColor === 'red' ? '#ef4444' : 
                          profileData.settings?.primaryColor === 'green' ? '#10b981' : 
                          profileData.settings?.primaryColor === 'purple' ? '#8b5cf6' : 
                          profileData.settings?.primaryColor === 'amber' ? '#f59e0b' : 
                          '#3b82f6'
                        }}
                      ></span>
                      {/* Versão segura da função que não causará erro */}
                      {profileData.settings?.primaryColor === 'default' ? 'Padrão (Azul)' : 
                        profileData.settings?.primaryColor ? 
                          profileData.settings.primaryColor.charAt(0).toUpperCase() + 
                          profileData.settings.primaryColor.slice(1) : 'Padrão (Azul)'
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Card do projeto */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden lg:col-span-2">
              <div className="px-4 py-5 border-b border-zinc-800 sm:px-6">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Configurações do Projeto
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <h4 className="text-base font-medium text-white">{profileData.settings?.projectName || "Meu Projeto"}</h4>
                  <p className="mt-2 text-sm text-gray-400">
                    {profileData.settings?.projectDescription || "Nenhuma descrição fornecida."}
                  </p>
                </div>
                <div className="border-t border-zinc-700 pt-5">
                  <div className="flex justify-end">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Ir para Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}