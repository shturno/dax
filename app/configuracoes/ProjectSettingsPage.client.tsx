'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';
import { useThemeColor, ThemeColor } from '@/components/theme-color-provider';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useProjectCache } from '@/hooks/useProjectCache';
import { logger } from '@/utils/logger';

interface Project {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export function ProjectSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { status } = useSession();
  const { color, setColor, ready } = useThemeColor();
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { fetchProject, updateProject, isLoading, error } = useProjectCache();

  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: color,
  });
  const [editorSettings, setEditorSettings] = useState({
    autoSave: true,
    autoSaveInterval: 5,
    fontSize: 16,
  });

  useEffect(() => {
    if (ready) setMounted(true);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    setAppearanceSettings(prev => ({ ...prev, primaryColor: color }));
  }, [color, ready]);

  useEffect(() => {
    const loadProject = async () => {
      logger.info('Iniciando carregamento do projeto atual');
      if (status !== 'authenticated') {
        logger.warn('Usuário não autenticado', { status });
        return;
      }

      try {
        logger.debug('Buscando projeto atual', { status });
        const project = await fetchProject('current');

        if (!project) {
          logger.error('Projeto não encontrado');
          toast({
            title: 'Erro',
            description: 'Nenhum projeto encontrado. Por favor, crie um projeto primeiro.',
            variant: 'destructive',
          });
          return;
        }

        if (!project.name || !project.description) {
          logger.error('Dados do projeto incompletos', { project });
          toast({
            title: 'Erro',
            description: 'Dados do projeto incompletos. Por favor, tente novamente.',
            variant: 'destructive',
          });
          return;
        }

        logger.info('Projeto carregado com sucesso', {
          projectId: project._id,
          name: project.name,
        });

        setCurrentProject(project);
        setProjectName(project.name);
        setProjectDescription(project.description || '');
      } catch (err) {
        const error = err as Error;
        logger.error('Erro ao carregar projeto', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });

        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o projeto. Por favor, tente novamente.',
          variant: 'destructive',
          action: (
            <ToastAction altText="Tentar novamente" onClick={() => loadProject()}>
              Tentar novamente
            </ToastAction>
          ),
        });
      }
    };

    loadProject();
  }, [status, toast, fetchProject]);

  const handleColorChange = (newColor: string) => {
    if (isValidThemeColor(newColor)) {
      setAppearanceSettings({ ...appearanceSettings, primaryColor: newColor });
      setColor(newColor);
    }
  };

  function isValidThemeColor(color: string): color is ThemeColor {
    return ['default', 'blue', 'green', 'purple', 'orange'].includes(color);
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!projectName.trim()) {
      errors.name = 'Nome do projeto é obrigatório';
    } else if (projectName.trim().length < 3) {
      errors.name = 'Nome do projeto deve ter pelo menos 3 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveProjectInfo = async () => {
    logger.info('Iniciando salvamento do projeto');

    if (!validateForm()) {
      logger.warn('Formulário inválido', { errors: formErrors });
      return;
    }

    if (status !== 'authenticated') {
      logger.warn('Usuário não autenticado', { status });
      toast({
        title: 'Não autenticado',
        description: 'Faça login para salvar.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentProject) {
      logger.warn('Nenhum projeto selecionado');
      toast({
        title: 'Erro',
        description: 'Nenhum projeto selecionado para salvar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updateData = {
        name: projectName.trim(),
        description: projectDescription.trim(),
      };

      logger.info('Atualizando projeto', {
        id: currentProject._id,
        data: updateData,
      });

      if (!currentProject._id) {
        throw new Error('ID do projeto inválido');
      }

      const updatedProject = await updateProject(currentProject._id, updateData);

      if (!updatedProject) {
        throw new Error('Projeto não foi atualizado corretamente');
      }

      logger.info('Projeto atualizado com sucesso', {
        projectId: updatedProject._id,
        name: updatedProject.name,
      });

      setCurrentProject(updatedProject);
      setProjectName(updatedProject.name);
      setProjectDescription(updatedProject.description || '');

      toast({
        title: 'Projeto atualizado',
        description: 'Nome e descrição salvos com sucesso.',
      });

      // Disparar evento de atualização
      const event = new CustomEvent('projectUpdated', {
        detail: { project: updatedProject },
      });
      window.dispatchEvent(event);
    } catch (err) {
      const error = err as Error;
      logger.error('Erro ao salvar projeto', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive',
        action: (
          <ToastAction altText="Tentar novamente" onClick={() => saveProjectInfo()}>
            Tentar novamente
          </ToastAction>
        ),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="loading-spinner">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Projeto</CardTitle>
          <CardDescription>Gerencie as configurações básicas do seu projeto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Nome do Projeto</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={e => {
                setProjectName(e.target.value);
                if (formErrors.name) {
                  setFormErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              placeholder="Nome do seu projeto"
              className={formErrors.name ? 'border-red-500' : ''}
            />
            {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectDescription">Descrição</Label>
            <Textarea
              id="projectDescription"
              value={projectDescription}
              onChange={e => setProjectDescription(e.target.value)}
              placeholder="Descreva seu projeto"
            />
          </div>
          <Button onClick={saveProjectInfo} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
