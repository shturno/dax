'use client';

import { useState, useEffect } from 'react';
import { safeFetch } from '@/utils/api-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, ArrowUp, Clock, Code, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Definir um tipo para o objeto do projeto, baseado na API
interface Project {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: any[];
  notes?: any[];
  roadmap?: any[];
  features?: any[];
  ideas?: any[];
  feedback?: any[];
}

export function OverviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados que eram fixos ou simulados - podem ser removidos ou derivados dos dados reais
  // const [progress, setProgress] = useState(40)
  // const [lastUpdate, setLastUpdate] = useState("2 horas")

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/projects', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }

        const jsonResponse = await response.json();
        console.log('Resposta da API:', jsonResponse); // Log para depuração

        if (!jsonResponse || typeof jsonResponse !== 'object' || !('success' in jsonResponse)) {
          throw new Error('Resposta inesperada da API');
        }

        const { success, projects, message } = jsonResponse;

        if (!success) {
          throw new Error(message || 'Erro ao carregar projetos');
        }

        setProjects(projects || []);
      } catch (err: any) {
        console.error('Erro ao buscar projetos:', err);
        setError(err.message || 'Erro ao carregar projetos');
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();

    // Adicionar listener para atualização do projeto
    const handleProjectUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ project: any }>;
      console.log('Evento de atualização do projeto recebido:', customEvent.detail);
      if (customEvent.detail?.project) {
        setProjects(prevProjects => {
          const updatedProjects = prevProjects.map(project =>
            project._id === customEvent.detail.project._id ? customEvent.detail.project : project
          );
          return updatedProjects;
        });
      } else {
        fetchProjects();
      }
    };

    window.addEventListener('projectUpdated', handleProjectUpdate);

    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('projectUpdated', handleProjectUpdate);
    };
  }, []);

  const handleProjectSelection = async (projectId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Content-Type': 'application/json',
          // Remover o uso de localStorage e confiar nos cookies gerenciados pelo NextAuth
        },
      });

      const jsonResponse = await response.json();

      if (!jsonResponse.success) {
        throw new Error(jsonResponse.message || 'Erro ao carregar projeto');
      }

      setProjects([jsonResponse.project]);
    } catch (err: any) {
      console.error('Erro ao carregar projeto:', err);
      setError(err.message || 'Erro ao carregar projeto');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Carregando projetos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-100 border border-red-400 p-4 rounded-md">
        <p>Erro ao carregar projetos: {error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="destructive"
          size="sm"
          className="mt-2"
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link href="/projects/new">
            <Button>Criar Novo Projeto</Button>
          </Link>
        </div>
        <p className="text-center text-muted-foreground">Nenhum projeto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/projects/new">
          <Button>Criar Novo Projeto</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projects
          .filter(p => p && p._id) // Filtra para garantir que apenas projetos válidos sejam exibidos
          .map((project) => (
          <Card key={project._id || `project-${Math.random()}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{project?.name || 'Sem nome'}</CardTitle>
              <Button onClick={() => handleProjectSelection(project._id)}>Selecionar</Button>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {project?.description || 'Sem descrição'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
