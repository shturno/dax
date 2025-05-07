'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userData, setUserData] = useState({
    username: '',
    email: '',
    settings: {
      projectName: '',
      projectDescription: '',
      notifications: true,
      autoSave: true,
      fontSize: 16,
      primaryColor: 'default',
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    async function fetchUserData() {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();

        if (data.success) {
          setUserData({
            ...data.user,
            settings: {
              projectName: '',
              projectDescription: '',
              notifications: true,
              autoSave: true,
              fontSize: 16,
              primaryColor: 'default',
              ...(data.user.settings || {}),
            },
          });
        } else {
          setError(data.message || 'Falha ao carregar dados do usuário');
        }
      } catch (err) {
        setError('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const redirectToProfile = () => {
    // Mostrar feedback antes de redirecionar
    setSuccess('Redirecionando para o perfil...');
    setTimeout(() => {
      router.push('/profile');
    }, 500); // Pequeno delay para feedback visual
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Garantir que o token de autenticação seja incluído (se necessário)
          ...(session?.user ? { Authorization: `Bearer ${session.user}` } : {}),
        },
        body: JSON.stringify({
          ...userData,
          // Garantir que as configurações sejam sempre enviadas como objeto
          settings: userData.settings || {
            projectName: '',
            projectDescription: '',
            notifications: true,
            autoSave: true,
            fontSize: 16,
            primaryColor: 'default',
          },
        }),
      });

      if (!res.ok) {
        // Verificar status HTTP
        if (res.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro no servidor');
      }

      const data = await res.json();

      if (data.success) {
        setSuccess(data.message || 'Perfil atualizado com sucesso!');

        // Atualizar os dados locais com a resposta atualizada
        if (data.user) {
          setUserData({
            ...data.user,
            settings: {
              ...userData.settings,
              ...(data.user.settings || {}),
            },
          });
        }
      } else {
        setError(data.message || 'Falha ao atualizar perfil');
      }
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.message || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);

      // Rolar para o topo para mostrar mensagem
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateField = (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [field]: e.target.value });
  };

  const updateSetting =
    (setting: string) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.type === 'number' || setting === 'fontSize'
            ? Number(e.target.value)
            : e.target.value;

      setUserData({
        ...userData,
        settings: { ...userData.settings, [setting]: value },
      });
    };

  return (
    <div className="min-h-screen bg-[#000]">
      <header className="bg-[#000] border-b border-zinc-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Editar Perfil</h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className="inline-flex items-center px-4 py-2 border border-zinc-800 rounded-md text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800"
            >
              Voltar ao Perfil
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-900/20 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-900/20 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-400">{success}</p>
              </div>
            </div>
          </div>
        )}

        {loading && !error ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-5 border-b border-zinc-800 sm:px-6">
              <h3 className="text-lg font-medium text-white">Informações do Usuário</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                      Nome de Usuário
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="username"
                        id="username"
                        value={userData.username}
                        onChange={updateField('username')}
                        className="block w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={userData.email}
                        disabled
                        className="block w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-gray-400 shadow-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email não pode ser alterado</p>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="projectName"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Nome do Projeto
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="projectName"
                        id="projectName"
                        value={userData.settings?.projectName || ''}
                        onChange={updateSetting('projectName')}
                        className="block w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="projectDescription"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Descrição do Projeto
                    </label>
                    <div className="mt-1">
                      <textarea
                        name="projectDescription"
                        id="projectDescription"
                        rows={3}
                        value={userData.settings?.projectDescription || ''}
                        onChange={updateSetting('projectDescription')}
                        className="block w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fontSize" className="block text-sm font-medium text-gray-300">
                      Tamanho da Fonte
                    </label>
                    <div className="mt-1">
                      <select
                        name="fontSize"
                        id="fontSize"
                        value={userData.settings?.fontSize || 16}
                        onChange={updateSetting('fontSize')}
                        className="block w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="12">12px</option>
                        <option value="14">14px</option>
                        <option value="16">16px</option>
                        <option value="18">18px</option>
                        <option value="20">20px</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="primaryColor"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Cor Primária
                    </label>
                    <div className="mt-1">
                      <select
                        name="primaryColor"
                        id="primaryColor"
                        value={userData.settings?.primaryColor || 'default'}
                        onChange={updateSetting('primaryColor')}
                        className="block w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="default">Padrão (Azul)</option>
                        <option value="red">Vermelho</option>
                        <option value="green">Verde</option>
                        <option value="purple">Roxo</option>
                        <option value="amber">Âmbar</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="notifications"
                        id="notifications"
                        checked={userData.settings?.notifications || false}
                        onChange={updateSetting('notifications')}
                        className="h-4 w-4 bg-zinc-800 border-zinc-700 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="notifications" className="ml-2 block text-sm text-gray-300">
                        Ativar notificações
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="autoSave"
                        id="autoSave"
                        checked={userData.settings?.autoSave || false}
                        onChange={updateSetting('autoSave')}
                        className="h-4 w-4 bg-zinc-800 border-zinc-700 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="autoSave" className="ml-2 block text-sm text-gray-300">
                        Ativar salvamento automático
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={redirectToProfile}
                    className="mr-3 bg-zinc-800 py-2 px-4 border border-zinc-700 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
