"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowUp, Clock, Code, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useProjectContext } from '@/context/ProjectContext'

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
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { projectId, setProjectId } = useProjectContext()

  // Função de busca de projetos reutilizável
  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/projects", { cache: 'no-store' })
      const data: { success: boolean; projects?: Project[]; project?: Project; message?: string; error?: string } = await response.json()
      if (response.ok && data.success) {
        const list = data.projects ?? (data.project ? [data.project] : [])
        setProjects(list)
        if (!projectId && list.length) {
          setProjectId(list[0]._id)
        }
      } else {
        throw new Error(data.error || data.message || 'Falha ao carregar projetos')
      }
    } catch (err: any) {
      setError(err.message)
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProjects()
    const handleProjectUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ project: Project }>).detail?.project
      if (detail) {
        setProjects(prev => prev.map(p => p._id === detail._id ? detail : p))
      } else {
        fetchProjects()
      }
    }
    window.addEventListener('projectUpdated', handleProjectUpdate)
    return () => window.removeEventListener('projectUpdated', handleProjectUpdate)
  }, [fetchProjects])

  // Computed values para o projeto selecionado e métricas
  const currentProject = useMemo(
    () => projects.find(p => p._id === projectId) ?? null,
    [projects, projectId]
  )
  const progress = useMemo(() => currentProject ? 65 : 0, [currentProject])
  const lastUpdate = useMemo(
    () => currentProject ? new Date(currentProject.updatedAt).toLocaleTimeString() : 'N/A',
    [currentProject]
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Carregando projetos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-100 border border-red-400 p-4 rounded-md">
        <p>Erro ao carregar projetos: {error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive" size="sm" className="mt-2">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Nenhum projeto encontrado</h2>
        <p className="text-muted-foreground mb-4">Parece que você ainda não criou nenhum projeto.</p>
        <Link href="/projects/new">
          <Button>Criar Primeiro Projeto</Button>
        </Link>
      </div>
    )
  }

  // Renderiza a visão geral com os dados do currentProject
  return (
    <div className="space-y-6">
      {/* Dropdown estilizado para selecionar qual projeto exibir */}
      <div className="flex items-center mb-4">
        <Select value={projectId || ''} onValueChange={(value) => setProjectId(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecione um projeto" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nome do Projeto</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentProject.name}</div>
            <p className="text-xs text-muted-foreground">{currentProject.description || "Sem descrição"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Atual</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-500 hover:bg-blue-600">Em Andamento</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Fase atual do projeto</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress}%</div>
            <Progress value={progress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ativa</div>
            <p className="text-xs text-muted-foreground">Última atualização às {lastUpdate}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Últimas Atualizações</CardTitle>
            <CardDescription>Atualizações recentes do projeto {currentProject.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Implementação do editor de código",
                  description: "Adicionado suporte para syntax highlighting e autocompletion",
                  date: "Hoje, 14:30",
                  icon: Code,
                },
                {
                  title: "Integração com API de IA",
                  description: "Conectado com modelo de linguagem para sugestões de código",
                  date: "Ontem, 10:15",
                  icon: Zap,
                },
                {
                  title: "Melhorias de UX",
                  description: "Redesenhada a interface do usuário para melhor experiência",
                  date: "2 dias atrás, 16:45",
                  icon: Activity,
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
            <CardDescription>Tarefas prioritárias para o projeto {currentProject.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Implementar suporte a extensões",
                  status: "Em breve",
                  priority: "Alta",
                },
                {
                  title: "Melhorar performance do editor",
                  status: "Em progresso",
                  priority: "Média",
                },
                {
                  title: "Adicionar temas personalizáveis",
                  status: "Em progresso",
                  priority: "Baixa",
                },
                {
                  title: "Implementar colaboração em tempo real",
                  status: "Planejado",
                  priority: "Alta",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Prioridade: {item.priority}</p>
                  </div>
                  <Badge
                    variant={
                      item.status === "Em progresso" ? "default" : item.status === "Em breve" ? "secondary" : "outline"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/tarefas">
                <Button size="sm" className="w-full">
                  Ver todas as tarefas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
