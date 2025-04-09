"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowUp, Clock, Code, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function OverviewPage() {
  const [progress, setProgress] = useState(40)
  const [lastUpdate, setLastUpdate] = useState("2 horas")
  const [projectInfo, setProjectInfo] = useState({
    name: "AI Editor",
    description: "Editor com IA acessado via navegador",
  })

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("settings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.projectName && settings.projectDescription) {
          setProjectInfo({
            name: settings.projectName,
            description: settings.projectDescription,
          })
        }
      } catch (e) {
        console.error("Erro ao carregar configurações:", e)
      }
    }
  }, [])

  // Simular progresso aumentando
  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress((prev) => Math.min(prev + 1, 100))
        setLastUpdate("agora mesmo")
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nome do Projeto</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectInfo.name}</div>
            <p className="text-xs text-muted-foreground">{projectInfo.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Atual</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className="bg-amber-500 hover:bg-amber-600">MVP</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Fase de desenvolvimento do MVP</p>
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
            <p className="text-xs text-muted-foreground">Última atualização há {lastUpdate}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Últimas Atualizações</CardTitle>
            <CardDescription>Atualizações recentes do projeto</CardDescription>
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
            <CardDescription>Tarefas prioritárias para o desenvolvimento</CardDescription>
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
