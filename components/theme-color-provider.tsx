'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { safeFetch } from '@/utils/api-helpers';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

export type ThemeColor = 'default' | 'blue' | 'green' | 'purple' | 'orange';

type ThemeColorContextType = {
  color: ThemeColor;
  setColor: (color: ThemeColor) => void;
  ready: boolean;
};

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [color, setColorState] = useState<ThemeColor>('default');
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('theme-color') : null;
      if (stored && isValidThemeColor(stored)) {
        setColorState(stored);
        applyThemeClass(stored);
      } else {
        applyThemeClass('default');
      }
      initialized.current = true;
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    applyThemeClass(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-color', color);
    }
  }, [color, ready]);

  function setColor(newColor: ThemeColor) {
    setColorState(newColor);
  }

  function isValidThemeColor(value: string): value is ThemeColor {
    return ['default', 'blue', 'green', 'purple', 'orange'].includes(value);
  }

  function applyThemeClass(theme: ThemeColor) {
    const classes = ['theme-default', 'theme-blue', 'theme-green', 'theme-purple', 'theme-orange'];
    document.documentElement.classList.remove(...classes);
    document.documentElement.classList.add(`theme-${theme}`);
  }

  return (
    <ThemeColorContext.Provider value={{ color, setColor, ready }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (!context) throw new Error('useThemeColor must be used within ThemeColorProvider');
  return context;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    projectName: 'AI Editor',
    projectDescription: 'Editor com IA acessado via navegador',
    notifications: true,
    autoSave: true,
    autoSaveInterval: 5,
    fontSize: 16,
    primaryColor: 'default',
  });
  const { color, setColor } = useThemeColor();

  const handleColorChange = (newColor: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      primaryColor: newColor,
    });
    if (isValidThemeColor(newColor)) {
      setColor(newColor);
    }
  };

  function isValidThemeColor(color: string): color is ThemeColor {
    return ['default', 'blue', 'green', 'purple', 'orange'].includes(color);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadSettings() {
      if (status === 'authenticated') {
        try {
          setLoading(true);
          const { data } = await safeFetch('/api/settings');

          if (data.success) {
            setSettings(data.settings);
          }
        } catch (error) {
          console.error('Erro ao carregar configurações:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar suas configurações.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    }

    if (mounted) {
      loadSettings();
    }
  }, [status, mounted]);

  useEffect(() => {
    if (mounted) {
      applyThemeSettings();
    }
  }, [settings.primaryColor, settings.fontSize, mounted]);

  const applyThemeSettings = () => {
    if (!settings) return;

    if (settings.primaryColor !== 'default') {
      document.documentElement.className = document.documentElement.className
        .replace(/primary-\w+/g, '')
        .trim();
      document.documentElement.classList.add(`primary-${settings.primaryColor}`);
    } else {
      document.documentElement.className = document.documentElement.className
        .replace(/primary-\w+/g, '')
        .trim();
    }
    document.documentElement.style.fontSize = `${settings.fontSize / 16}rem`;
  };

  const saveSettings = async () => {
    if (status !== 'authenticated') {
      toast({
        title: 'Não autenticado',
        description: 'Você precisa estar conectado para salvar configurações.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await safeFetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (data.success) {
        applyThemeSettings();
        toast({
          title: 'Configurações salvas',
          description: 'Suas configurações foram salvas com sucesso.',
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });

        if (settings.primaryColor && isValidThemeColor(settings.primaryColor)) {
          setColor(settings.primaryColor);
        }
      } else {
        throw new Error(data.message || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar suas configurações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configurações</h2>
        <Button onClick={saveSettings} size="lg" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
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
                <Label htmlFor="projectName" className="text-base">
                  Nome do Projeto
                </Label>
                <Input
                  id="projectName"
                  value={settings.projectName}
                  onChange={e => setSettings({ ...settings, projectName: e.target.value })}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="text-base">
                  Descrição
                </Label>
                <Input
                  id="projectDescription"
                  value={settings.projectDescription}
                  onChange={e => setSettings({ ...settings, projectDescription: e.target.value })}
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Notificações</CardTitle>
              <CardDescription className="text-base">
                Configurações de notificações e alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="flex-1 text-base">
                  Ativar notificações
                </Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, notifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Salvamento Automático</CardTitle>
              <CardDescription className="text-base">
                Configurações de salvamento automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoSave" className="flex-1 text-base">
                  Ativar salvamento automático
                </Label>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, autoSave: checked })
                  }
                />
              </div>
              {settings.autoSave && (
                <div className="space-y-2">
                  <Label htmlFor="autoSaveInterval" className="text-base">
                    Intervalo de salvamento (minutos)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="autoSaveInterval"
                      min={1}
                      max={30}
                      step={1}
                      value={[settings.autoSaveInterval]}
                      onValueChange={(value: number[]) =>
                        setSettings({ ...settings, autoSaveInterval: value[0] })
                      }
                      className="flex-1"
                    />
                    <span className="w-12 text-center text-base">{settings.autoSaveInterval}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Tema</CardTitle>
              <CardDescription className="text-base">
                Configurações de aparência do dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-base">
                  Tema
                </Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme" className="text-base">
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light" className="text-base">
                      Claro
                    </SelectItem>
                    <SelectItem value="dark" className="text-base">
                      Escuro
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-base">
                  Cor Primária
                </Label>
                <Select
                  value={settings.primaryColor}
                  onValueChange={(value: string) => handleColorChange(value)}
                >
                  <SelectTrigger id="primaryColor" className="text-base">
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" className="text-base">
                      Padrão
                    </SelectItem>
                    <SelectItem value="blue" className="text-base">
                      Azul
                    </SelectItem>
                    <SelectItem value="green" className="text-base">
                      Verde
                    </SelectItem>
                    <SelectItem value="purple" className="text-base">
                      Roxo
                    </SelectItem>
                    <SelectItem value="orange" className="text-base">
                      Laranja
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full text-base py-5"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Visualização</CardTitle>
              <CardDescription className="text-base">Configurações de visualização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fontSize" className="text-base">
                  Tamanho da Fonte
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="fontSize"
                    min={14}
                    max={24}
                    step={1}
                    value={[settings.fontSize]}
                    onValueChange={(value: number[]) =>
                      setSettings({ ...settings, fontSize: value[0] })
                    }
                    className="flex-1"
                  />
                  <span className="w-16 text-center text-base">{settings.fontSize}px</span>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-base font-medium">Prévia:</p>
                <div className="mt-2 rounded-md border p-4">
                  <h3 className="text-lg font-semibold">Exemplo de Texto</h3>
                  <p className="text-base text-muted-foreground">
                    Este é um exemplo de como o texto aparecerá com o tamanho de fonte selecionado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="editor" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Configurações do Editor</CardTitle>
              <CardDescription className="text-base">
                Personalize seu ambiente de edição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoComplete" className="flex-1 text-base">
                  Autocompletar com IA
                </Label>
                <Switch id="autoComplete" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="syntaxHighlight" className="flex-1 text-base">
                  Destacamento de Sintaxe
                </Label>
                <Switch id="syntaxHighlight" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lineNumbers" className="flex-1 text-base">
                  Números de Linha
                </Label>
                <Switch id="lineNumbers" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="wordWrap" className="flex-1 text-base">
                  Quebra de Linha
                </Label>
                <Switch id="wordWrap" defaultChecked />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Inteligência Artificial</CardTitle>
              <CardDescription className="text-base">
                Configurações de IA para o editor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiModel" className="text-base">
                  Modelo de IA
                </Label>
                <Select defaultValue="gpt4">
                  <SelectTrigger id="aiModel" className="text-base">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt4" className="text-base">
                      GPT-4
                    </SelectItem>
                    <SelectItem value="gpt3" className="text-base">
                      GPT-3.5
                    </SelectItem>
                    <SelectItem value="codex" className="text-base">
                      Codex
                    </SelectItem>
                    <SelectItem value="custom" className="text-base">
                      Modelo Personalizado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiSuggestionFrequency" className="text-base">
                  Frequência de Sugestões
                </Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="aiSuggestionFrequency" className="text-base">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high" className="text-base">
                      Alta
                    </SelectItem>
                    <SelectItem value="medium" className="text-base">
                      Média
                    </SelectItem>
                    <SelectItem value="low" className="text-base">
                      Baixa
                    </SelectItem>
                    <SelectItem value="manual" className="text-base">
                      Manual
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
