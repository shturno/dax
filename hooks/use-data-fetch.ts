import { useState, useEffect, useCallback } from 'react';

// Tipagem para o estado do hook
export type FetchState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error', error: Error }
  | { status: 'success', data: T };

/**
 * Hook para buscar dados com gerenciamento de estado
 * 
 * @param fetchFn - Função assíncrona que retorna dados
 * @param immediate - Se true, executa a busca imediatamente
 * @param dependencies - Array de dependências que disparam uma nova busca
 */
export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  immediate = true,
  dependencies: any[] = []
): [FetchState<T>, () => Promise<void>] {
  const [state, setState] = useState<FetchState<T>>({ status: 'idle' });

  const fetchData = useCallback(async () => {
    setState({ status: 'loading' });
    
    try {
      const data = await fetchFn();
      setState({ status: 'success', data });
    } catch (error) {
      setState({ 
        status: 'error', 
        error: error instanceof Error ? error : new Error('An unknown error occurred') 
      });
    }
  }, [fetchFn]);

  // Executa a busca quando o componente monta ou quando as dependências mudam
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [...dependencies, fetchFn, immediate]);

  return [state, fetchData];
}

// Exemplo de uso:
/*
const [userState, refreshUserData] = useDataFetch<User>(
  () => fetchUserData(userId),
  true,
  [userId]
);

return (
  <DataCard 
    title="User Profile"
    dataState={userState}
    renderData={(data) => (
      <UserProfile user={data} />
    )}
    onRefresh={refreshUserData}
  />
);
*/ 