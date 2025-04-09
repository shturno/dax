"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Interface para tipagem das configurações
interface UserSettings {
  projectName: string
  projectDescription: string
  notifications: boolean
  autoSave: boolean
  autoSaveInterval: number
  fontSize: number
  primaryColor: string
}

// Interface para dados do usuário
interface UserData {
  username: string
  email: string
  settings: UserSettings
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  // Buscar dados do usuário
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/settings")
        const data = await response.json()
        
        if (data.success) {
          setUserData(data.user)
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível carregar as configurações",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao buscar as configurações",
          variant: "destructive",
        })
      }
    }

    if (session) {
      fetchUserData()
    }
  }, [session, toast])

  // Manipular alterações nos campos do formulário
  const handleSettingsChange = (key: keyof UserSettings, value: any) => {
    if (!userData) return
    
    setUserData({
      ...userData,
      settings: {
        ...userData.settings,
        [key]: value,
      },
    })
  }

  // Salvar configurações
  const handleSaveSettings = async () => {
    if (!userData) return
    
    setLoading(true)
    
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: userData.settings,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Configurações salvas",
          description: "Suas configurações foram atualizadas com sucesso",
        })
      } else {
        throw new Error(data.message || "Erro ao salvar configurações")
      }
    } catch (error: any) {
      console.error("Erro ao salvar:", error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar as configurações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Renderizar mensagem de carregamento se não houver dados
  if (!userData) {
    return (
      <DashboardLayout>
        <div className="container py-10">
          <h1 className="text-2xl font-bold mb-6">Configurações</h1>
          <div className="flex items-center justify-center h-[50vh]">
            <p>Carregando configurações...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Configurações</h1>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="project">Projeto</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>
          
          {/* Tab de Conta */}
          <TabsContent value="account" className="space-y-6">
            <div className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-semibold">Informações da Conta</h2>
              
              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <Input 
                  id="username" 
                  value={userData.username} 
                  disabled 
                />
                <p className="text-sm text-muted-foreground">O nome de usuário não pode ser alterado.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={userData.email} 
                  disabled 
                />
                <p className="text-sm text-muted-foreground">O email não pode ser alterado.</p>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Projeto */}
          <TabsContent value="project" className="space-y-6">
            <div className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-semibold">Configurações do Projeto</h2>
              
              <div className="space-y-2">
                <Label htmlFor="projectName">Nome do Projeto</Label>
                <Input 
                  id="projectName" 
                  value={userData.settings.projectName}
                  onChange={(e) => handleSettingsChange("projectName", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Descrição do Projeto</Label>
                <Textarea 
                  id="projectDescription" 
                  value={userData.settings.projectDescription}
                  onChange={(e) => handleSettingsChange("projectDescription", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Editor */}
          <TabsContent value="editor" className="space-y-6">
            <div className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-semibold">Configurações do Editor</h2>
              
              <div className="space-y-2">
                <Label htmlFor="fontSize">Tamanho da Fonte: {userData.settings.fontSize}px</Label>
                <Slider 
                  id="fontSize"
                  min={10} 
                  max={24}
                  step={1}
                  value={[userData.settings.fontSize]}
                  onValueChange={(value) => handleSettingsChange("fontSize", value[0])}
                  className="py-4"
                />
              </div>
              
              <div className="flex items-center justify-between space-y-0 pt-2">
                <Label htmlFor="autoSave">Salvamento Automático</Label>
                <Switch 
                  id="autoSave" 
                  checked={userData.settings.autoSave}
                  onCheckedChange={(checked) => handleSettingsChange("autoSave", checked)}
                />
              </div>
              
              {userData.settings.autoSave && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="autoSaveInterval">
                    Intervalo de Salvamento: {userData.settings.autoSaveInterval} minutos
                  </Label>
                  <Slider 
                    id="autoSaveInterval"
                    min={1} 
                    max={15}
                    step={1}
                    value={[userData.settings.autoSaveInterval]}
                    onValueChange={(value) => handleSettingsChange("autoSaveInterval", value[0])}
                    className="py-4"
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Tab de Notificações */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-semibold">Configurações de Notificações</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-base">Notificações</Label>
                  <p className="text-sm text-muted-foreground">Receba atualizações sobre o sistema</p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={userData.settings.notifications}
                  onCheckedChange={(checked) => handleSettingsChange("notifications", checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button 
            onClick={handleSaveSettings} 
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}