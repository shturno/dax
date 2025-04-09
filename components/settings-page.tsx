"use client"

import { useState, useEffect } from "react"
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
import { useThemeColor } from '@/components/theme-color-provider'

interface ThemeColorOption {
  value: string;
  label: string;
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { setThemeColor } = useThemeColor()
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState({
    projectName: "AI Editor",
    projectDescription: "Editor com IA acessado via navegador",
    notifications: true,
    autoSave: true,
    autoSaveInterval: 5,
    fontSize: 14,
    primaryColor: "default",
  })

  // Garantir que o componente está montado para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("settings")
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings((prevSettings) => ({ ...prevSettings, ...parsedSettings }))
      } catch (e) {
        console.error("Erro ao carregar configurações:", e)
      }
    }
  }, [])

  // Aplicar configurações de cor e tamanho de fonte
  useEffect(() => {
    if (mounted) {
      applyThemeSettings()
    }
  }, [settings.primaryColor, settings.fontSize, mounted])

  // Função para aplicar configurações de tema
  const applyThemeSettings = () => {
    // Aplicar cor primária
    if (settings.primaryColor !== "default") {
      setThemeColor(`primary-${settings.primaryColor}`); // Adicione este método
      document.documentElement.className = document.documentElement.className.replace(/primary-\w+/g, "").trim();
      document.documentElement.classList.add(`primary-${settings.primaryColor}`);
    } else {
      document.documentElement.className = document.documentElement.className.replace(/primary-\w+/g, "").trim();
    }

    // Aplicar tamanho de fonte base
    document.documentElement.style.fontSize = `${settings.fontSize / 16}rem`;
  }

  // Salvar configurações no localStorage
  const saveSettings = () => {
    localStorage.setItem("settings", JSON.stringify(settings))
    applyThemeSettings()

    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram salvas com sucesso.",
      action: <ToastAction altText="Ok">Ok</ToastAction>,
    })
  }

  // Se não estiver montado, não renderiza para evitar problemas de hidratação
  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Configurações</h2>
        <Button onClick={saveSettings}>Salvar Alterações</Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
              <CardDescription>Configurações básicas do seu projeto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Nome do Projeto</Label>
                <Input
                  id="projectName"
                  value={settings.projectName}
                  onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Descrição</Label>
                <Input
                  id="projectDescription"
                  value={settings.projectDescription}
                  onChange={(e) => setSettings({ ...settings, projectDescription: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configurações de notificações e alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="flex-1">
                  Ativar notificações
                </Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, notifications: checked })}
                />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Salvamento Automático</CardTitle>
              <CardDescription>Configurações de salvamento automático</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                <Label htmlFor="autoSave" className="flex-1">
                  Ativar salvamento automático
                </Label>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, autoSave: checked })}
                />
                </div>
              {settings.autoSave && (
                <div className="space-y-2">
                  <Label htmlFor="autoSaveInterval">Intervalo de salvamento (minutos)</Label>
                    <div className="flex items-center gap-4">
                    <Slider
                      id="autoSaveInterval"
                      min={1}
                      max={30}
                      step={1}
                      value={[settings.autoSaveInterval]}
                      onValueChange={(value: number[]) => setSettings({ ...settings, autoSaveInterval: value[0] })}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{settings.autoSaveInterval}</span>
                    </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4 space-y-4">
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
                  value={settings.primaryColor}
                  onValueChange={(value: string) => {
                    setSettings({ ...settings, primaryColor: value });
                    if (value !== "default") {
                      setThemeColor(`primary-${value}`);
                    }
                  }}
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
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visualização</CardTitle>
              <CardDescription>Configurações de visualização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fontSize">Tamanho da Fonte</Label>
                <div className="flex items-center gap-4">
                  <Slider
                  id="fontSize"
                  min={12}
                  max={20}
                  step={1}
                  value={[settings.fontSize]}
                  onValueChange={(value: number[]) => setSettings({ ...settings, fontSize: value[0] })}
                  className="flex-1"
                  />
                  <span className="w-12 text-center">{settings.fontSize}px</span>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm font-medium">Prévia:</p>
                <div className="mt-2 rounded-md border p-4">
                  <h3 className="text-lg font-semibold">Exemplo de Texto</h3>
                  <p className="text-sm text-muted-foreground">
                    Este é um exemplo de como o texto aparecerá com o tamanho de fonte selecionado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Editor</CardTitle>
              <CardDescription>Personalize seu ambiente de edição</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoComplete" className="flex-1">
                  Autocompletar com IA
                </Label>
                <Switch id="autoComplete" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="syntaxHighlight" className="flex-1">
                  Destacamento de Sintaxe
                </Label>
                <Switch id="syntaxHighlight" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lineNumbers" className="flex-1">
                  Números de Linha
                </Label>
                <Switch id="lineNumbers" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="wordWrap" className="flex-1">
                  Quebra de Linha
                </Label>
                <Switch id="wordWrap" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inteligência Artificial</CardTitle>
              <CardDescription>Configurações de IA para o editor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiModel">Modelo de IA</Label>
                <Select defaultValue="gpt4">
                  <SelectTrigger id="aiModel">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt4">GPT-4</SelectItem>
                    <SelectItem value="gpt3">GPT-3.5</SelectItem>
                    <SelectItem value="codex">Codex</SelectItem>
                    <SelectItem value="custom">Modelo Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiSuggestionFrequency">Frequência de Sugestões</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="aiSuggestionFrequency">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
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
