"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { useThemeColor, ThemeColor } from "@/components/theme-color-provider"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface Project {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { status } = useSession()
  const { color, setColor, ready } = useThemeColor()
  const [mounted, setMounted] = useState(false)

  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectLoading, setProjectLoading] = useState(true)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [isSavingProject, setIsSavingProject] = useState(false)

  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: color,
  })
  const [editorSettings, setEditorSettings] = useState({
    autoSave: true,
    autoSaveInterval: 5,
    fontSize: 16,
  })

  useEffect(() => {
    if (ready) setMounted(true)
  }, [ready])

  useEffect(() => {
    if (!ready) return
    setAppearanceSettings((prev) => ({ ...prev, primaryColor: color }))
  }, [color, ready])

  const fetchProject = async () => {
    console.log("Iniciando fetchProject")
    setProjectLoading(true)
    setProjectError(null)
    try {
      console.log("Fazendo requisição para /api/projects")
      const response = await fetch("/api/projects")
      console.log("Resposta recebida:", {
        status: response.status,
        statusText: response.statusText
      })

      if (!response.ok) throw new Error(`Falha ao buscar projeto (${response.status})`)
      const data = await response.json()
      console.log("Dados do projeto recebidos:", data)

      if (Array.isArray(data) && data.length > 0) {
        const project = data[0] as Project
        console.log("Projeto carregado:", project)
        setCurrentProject(project)
        setProjectName(project.name || "")
        setProjectDescription(project.description || "")
      } else {
        console.log("Nenhum projeto encontrado")
        setCurrentProject(null)
        setProjectError("Nenhum projeto encontrado para configurar.")
      }
    } catch (err: any) {
      console.error("Erro ao buscar projeto:", err)
      setProjectError(err.message)
      setCurrentProject(null)
    } finally {
      setProjectLoading(false)
    }
  }

  useEffect(() => {
    console.log("Componente montado, iniciando fetchProject")
    fetchProject()
  }, [])

  const handleColorChange = (newColor: string) => {
    if (isValidThemeColor(newColor)) {
      setAppearanceSettings({ ...appearanceSettings, primaryColor: newColor })
      setColor(newColor)
    }
  }

  function isValidThemeColor(color: string): color is ThemeColor {
    return ["default", "blue", "green", "purple", "orange"].includes(color)
  }

  const saveProjectInfo = async () => {
    console.log("Iniciando saveProjectInfo")
    if (status !== "authenticated") {
      console.log("Usuário não autenticado")
      toast({ title: "Não autenticado", description: "Faça login para salvar.", variant: "destructive" })
      return
    }
    if (!currentProject) {
      console.log("Nenhum projeto selecionado")
      toast({ title: "Erro", description: "Nenhum projeto selecionado para salvar.", variant: "destructive" })
      return
    }

    setIsSavingProject(true)
    try {
      const updateData = { 
        name: projectName, 
        description: projectDescription 
      }
      
      console.log("Enviando atualização do projeto:", {
        id: currentProject._id,
        data: updateData,
        url: `/api/projects/${currentProject._id}`
      })

      const response = await fetch(`/api/projects/${currentProject._id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(updateData),
      })

      console.log("Resposta recebida:", {
        status: response.status,
        statusText: response.statusText
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Erro na resposta:", errorData)
        throw new Error(errorData.error || "Falha ao atualizar projeto")
      }

      const data = await response.json()
      console.log("Dados da resposta:", data)
      
      if (data.success && data.project) {
        toast({ title: "Projeto atualizado", description: "Nome e descrição salvos com sucesso." })
        
        // Atualizar estado local
        const updatedProject = {
          ...data.project,
          _id: data.project._id,
          ownerId: data.project.ownerId
        }
        
        console.log("Projeto atualizado localmente:", updatedProject)
        setCurrentProject(updatedProject)
        setProjectName(updatedProject.name)
        setProjectDescription(updatedProject.description || "")
        
        // Disparar evento de atualização
        console.log("Disparando evento projectUpdated")
        const event = new CustomEvent('projectUpdated', {
          detail: { project: updatedProject }
        })
        window.dispatchEvent(event)
      } else {
        throw new Error("Resposta inválida do servidor")
      }
    } catch (err: any) {
      console.error("Erro ao salvar projeto:", err)
      toast({ 
        title: "Erro ao salvar", 
        description: err.message, 
        variant: "destructive",
        action: <ToastAction altText="Tentar novamente">Tentar novamente</ToastAction>
      })
    } finally {
      setIsSavingProject(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configurações</h2>
        <Button 
          onClick={() => {
            console.log("Botão salvar clicado")
            console.log("Dados atuais:", {
              projectName,
              projectDescription,
              currentProject
            })
            saveProjectInfo()
          }} 
          disabled={isSavingProject || projectLoading}
        >
          {isSavingProject ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
              <CardDescription>Configurações básicas do seu projeto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Carregando projeto...</span>
                </div>
              ) : projectError ? (
                <p className="text-red-600">Erro: {projectError}</p>
              ) : currentProject ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Nome do Projeto</Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      disabled={isSavingProject}
                      placeholder="Digite o nome do projeto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">Descrição</Label>
                    <Textarea
                      id="projectDescription"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Uma breve descrição do projeto"
                      rows={3}
                      disabled={isSavingProject}
                    />
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Nenhum projeto encontrado. Crie um projeto primeiro.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>Configurações de aparência do dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <Select
                  value={appearanceSettings.primaryColor}
                  onValueChange={handleColorChange}
                >
                  <SelectTrigger id="primaryColor">
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Editor</CardTitle>
              <CardDescription>Preferências relacionadas ao editor de código/texto.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Font Size: {editorSettings.fontSize}</Label>
              </div>
              <p className="text-muted-foreground mt-4">Configurações do editor ainda não implementadas completamente.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}
