'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/new-path/${id}/route`)
      .then(async res => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Erro ao buscar projeto');
        }
        return res.json();
      })
      .then(data => {
        // Garante que só renderiza se for um projeto válido
        let proj = null;
        if (data && data.project) {
          proj = data.project;
        }
        // Nunca renderiza JSON cru, só projeto válido
        if (
          proj &&
          typeof proj === 'object' &&
          typeof proj._id === 'string' &&
          typeof proj.name === 'string' &&
          typeof proj.ownerId === 'string' &&
          typeof proj.createdAt === 'string'
        ) {
          setProject(proj);
        } else {
          setProject(null);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <p>Erro: {error}</p>
        <button
          onClick={() => router.push('/projects/new')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Criar novo projeto
        </button>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>Projeto não encontrado.</p>
        <button
          onClick={() => router.push('/projects/new')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Criar novo projeto
        </button>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>ID: {project._id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Descrição:</strong>
            <div>
              {project.description || (
                <span className="italic text-muted-foreground">Sem descrição</span>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <div>Criado em: {new Date(project.createdAt).toLocaleString()}</div>
            <div>Atualizado em: {new Date(project.updatedAt).toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
