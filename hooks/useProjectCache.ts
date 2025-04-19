import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface Project {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface CacheEntry {
  data: Project;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const projectCache = new Map<string, CacheEntry>();

export function useProjectCache() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCachedProject = useCallback((projectId: string): Project | null => {
    const cached = projectCache.get(projectId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info('Retornando projeto do cache', { projectId });
      return cached.data;
    }
    return null;
  }, []);

  const setCachedProject = useCallback((project: Project) => {
    projectCache.set(project._id, {
      data: project,
      timestamp: Date.now()
    });
    logger.info('Projeto armazenado em cache', { projectId: project._id });
  }, []);

  const invalidateCache = useCallback((projectId?: string) => {
    if (projectId) {
      projectCache.delete(projectId);
      logger.info('Cache invalidado para projeto', { projectId });
    } else {
      projectCache.clear();
      logger.info('Cache completamente invalidado');
    }
  }, []);

  const fetchProject = useCallback(async (projectId: string): Promise<Project> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar cache primeiro
      const cached = getCachedProject(projectId);
      if (cached) {
        return cached;
      }

      logger.info('Buscando projeto do servidor', { projectId });
      
      // Se o ID for "current", usar o endpoint de projeto atual
      const endpoint = projectId === "current" 
        ? "/api/projects" 
        : `/api/projects/${projectId}`;
      
      const response = await fetch(endpoint, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        logger.error(`HTTP ${response.status}: ${responseData.error || 'Erro desconhecido'}`, { 
          projectId,
          status: response.status,
          statusText: response.statusText,
          responseData
        });
        throw new Error(responseData.error || `Falha ao buscar projeto: ${response.statusText}`);
      }

      // Ajustar para lidar com o formato de resposta quando o ID é "current"
      const project = responseData.project || (responseData.success ? responseData.project : null);

      if (!project) {
        logger.error('Resposta da API inválida', { 
          projectId,
          responseData
        });
        throw new Error('Resposta da API inválida');
      }

      setCachedProject(project);
      return project;
    } catch (err) {
      const error = err as Error;
      logger.error('Erro ao buscar projeto', { 
        error: error.message,
        stack: error.stack,
        projectId,
        timestamp: new Date().toISOString()
      });
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getCachedProject, setCachedProject]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!projectId) {
        throw new Error("ID do projeto é obrigatório");
      }

      logger.info('Atualizando projeto', { projectId, updates });
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(updates)
      });

      const responseData = await response.json();

      if (!response.ok) {
        logger.error(`HTTP ${response.status}: ${responseData.error || 'Erro desconhecido'}`, { 
          projectId,
          status: response.status,
          statusText: response.statusText,
          responseData
        });
        throw new Error(responseData.error || `Falha ao atualizar projeto: ${response.statusText}`);
      }

      if (!responseData.project) {
        logger.error('Resposta da API inválida após atualização', { 
          projectId,
          responseData
        });
        throw new Error('Resposta da API inválida após atualização');
      }

      setCachedProject(responseData.project);
      return responseData.project;
    } catch (err) {
      const error = err as Error;
      logger.error('Erro ao atualizar projeto', { 
        error: error.message,
        stack: error.stack,
        projectId,
        timestamp: new Date().toISOString()
      });
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setCachedProject]);

  // Limpar cache quando o componente desmontar
  useEffect(() => {
    return () => {
      invalidateCache();
    };
  }, [invalidateCache]);

  return {
    getCachedProject,
    fetchProject,
    updateProject,
    invalidateCache,
    isLoading,
    error
  };
} 