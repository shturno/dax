"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { useThemeColor, ThemeColor } from "@/components/theme-color-provider"
import { SessionProvider } from "next-auth/react"
import { ThemeColorProvider } from "@/components/theme-color-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeColorProvider>
        {children}
      </ThemeColorProvider>
    </SessionProvider>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { color, setColor } = useThemeColor()
  const [settings, setSettings] = useState({
    projectName: "AI Editor",
    projectDescription: "Editor com IA acessado via navegador",
    notifications: true,
    autoSave: true,
    autoSaveInterval: 5,
    fontSize: 16,
    primaryColor: color,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      primaryColor: color,
    }))
  }, [color])

  useEffect(() => {
    if (mounted) {
      const stored = localStorage.getItem("theme-color")
      if (stored && isValidThemeColor(stored)) {
        setSettings((prev) => ({
          ...prev,
          primaryColor: stored,
        }))
        setColor(stored)
      }
    }
  }, [mounted])

  const handleColorChange = (newColor: string) => {
    if (isValidThemeColor(newColor)) {
      setSettings({
        ...settings,
        primaryColor: newColor,
      })
      setColor(newColor)
    }
  }

  function isValidThemeColor(color: string): color is ThemeColor {
    return ["default", "blue", "green", "purple", "orange"].includes(color)
  }

  const saveSettings = async () => {
    if (status !== "authenticated") {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar conectado para salvar configurações.",
        variant: "destructive",
      })
      return
    }
    try {
      setLoading(true)
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: "Configurações salvas",
          description: "Suas configurações foram salvas com sucesso.",
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        })
        if (settings.primaryColor && isValidThemeColor(settings.primaryColor)) {
          setColor(settings.primaryColor)
        }
      } else {
        throw new Error(data.message)
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas configurações.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configurações</h2>
        <Button onClick={saveSettings} size="lg" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general" className="text-base py-2">
            Geral
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-base py-2">
            Aparência
          </TabsTrigger>
          <TabsTrigger value="editor" className="text-base py-2">
            Editor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informações do Projeto</CardTitle>
              <CardDescription className="text-base">
                Configurações básicas do seu projeto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-base">Nome do Projeto</Label>
                <Input
                  id="projectName"
                  value={settings.projectName}
                  onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="text-base">Descrição</Label>
                <Input
                  id="projectDescription"
                  value={settings.projectDescription}
                  onChange={(e) => setSettings({ ...settings, projectDescription: e.target.value })}
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Tema</CardTitle>
              <CardDescription className="text-base">Configurações de aparência do dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-base">Tema</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme" className="text-base">
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light" className="text-base">Claro</SelectItem>
                    <SelectItem value="dark" className="text-base">Escuro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-base">Cor Primária</Label>
                <Select
                  value={settings.primaryColor}
                  onValueChange={handleColorChange}
                >
                  <SelectTrigger id="primaryColor" className="text-base">
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" className="text-base">Padrão</SelectItem>
                    <SelectItem value="blue" className="text-base">Azul</SelectItem>
                    <SelectItem value="green" className="text-base">Verde</SelectItem>
                    <SelectItem value="purple" className="text-base">Roxo</SelectItem>
                    <SelectItem value="orange" className="text-base">Laranja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}
