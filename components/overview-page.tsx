"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowUp, Clock, Code, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

  // Estados que eram fixos ou simulados - podem ser removidos ou derivados dos dados reais
  // const [progress, setProgress] = useState(40) 
  // const [lastUpdate, setLastUpdate] = useState("2 horas")

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/projects", {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 404) {
            setProjects([])
            return
          }
          throw new Error(errorData.error || "Falha ao buscar projetos")
        }

        const data = await response.json()
        console.log("Dados recebidos da API:", data)
        
        if (data.success && data.project) {
          setProjects([data.project])
        } else if (data.projects) {
          setProjects(data.projects)
        } else {
          setProjects([])
        }
      } catch (err: any) {
        console.error("Erro ao buscar projetos:", err)
        setError(err.message || "Erro ao carregar projetos")
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()

    // Adicionar listener para atualização do projeto
    const handleProjectUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ project: any }>
      console.log("Evento de atualização do projeto recebido:", customEvent.detail)
      if (customEvent.detail?.project) {
        setProjects(prevProjects => {
          const updatedProjects = prevProjects.map(project => 
            project._id === customEvent.detail.project._id ? customEvent.detail.project : project
          )
          return updatedProjects
        })
      } else {
        fetchProjects()
      }
    }

    window.addEventListener('projectUpdated', handleProjectUpdate)

    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('projectUpdated', handleProjectUpdate)
    }
  }, [])

  // Seleciona o primeiro projeto para exibição (ou null se não houver projetos)
  const currentProject = projects.length > 0 ? projects[0] : null

  // Simular progresso e última atualização (pode ser substituído por dados reais do projeto se disponíveis)
  const progress = currentProject ? 65 : 0 // Exemplo
  const lastUpdate = currentProject ? new Date(currentProject.updatedAt).toLocaleTimeString() : "N/A" // Exemplo

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
