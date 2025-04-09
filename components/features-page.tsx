"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Filter, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

type Feature = {
  id: string
  title: string
  description: string
  priority: "Baixa" | "Média" | "Alta"
  status: "Planejado" | "Em Progresso" | "Concluído"
  type: "Core" | "UI/UX" | "Performance" | "Integração" | "IA"
}

export function FeaturesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [priorityFilter, setPriorityFilter] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentFeatureId, setCurrentFeatureId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [featureToDelete, setFeatureToDelete] = useState<string | null>(null)

  const [newFeature, setNewFeature] = useState<Omit<Feature, "id">>({
    title: "",
    description: "",
    priority: "Média",
    status: "Planejado",
    type: "Core",
  })

  const [features, setFeatures] = useState<Feature[]>([
    {
      id: "1",
      title: "Editor de código com syntax highlighting",
      description: "Suporte para destacamento de sintaxe em múltiplas linguagens de programação",
      priority: "Alta",
      status: "Concluído",
      type: "Core",
    },
    {
      id: "2",
      title: "Autocompletion com IA",
      description: "Sugestões de código inteligentes baseadas em contexto usando IA",
      priority: "Alta",
      status: "Em Progresso",
      type: "IA",
    },
    {
      id: "3",
      title: "Sistema de temas personalizáveis",
      description: "Permitir que usuários criem e compartilhem temas visuais",
      priority: "Média",
      status: "Planejado",
      type: "UI/UX",
    },
    {
      id: "4",
      title: "Otimização para arquivos grandes",
      description: "Melhorar performance ao trabalhar com arquivos de código extensos",
      priority: "Alta",
      status: "Em Progresso",
      type: "Performance",
    },
    {
      id: "5",
      title: "Integração com GitHub",
      description: "Suporte para clonar, commitar e fazer push para repositórios GitHub",
      priority: "Média",
      status: "Planejado",
      type: "Integração",
    },
    {
      id: "6",
      title: "Terminal integrado",
      description: "Terminal embutido para executar comandos sem sair do editor",
      priority: "Média",
      status: "Planejado",
      type: "Core",
    },
    {
      id: "7",
      title: "Colaboração em tempo real",
      description: "Edição colaborativa com múltiplos usuários simultaneamente",
      priority: "Alta",
      status: "Planejado",
      type: "Core",
    },
    {
      id: "8",
      title: "Depurador integrado",
      description: "Ferramentas de depuração para múltiplas linguagens de programação",
      priority: "Baixa",
      status: "Planejado",
      type: "Core",
    },
  ])

  // Carregar features do localStorage
  useEffect(() => {
    const savedFeatures = localStorage.getItem("features")
    if (savedFeatures) {
      try {
        setFeatures(JSON.parse(savedFeatures))
      } catch (e) {
        console.error("Erro ao carregar features:", e)
      }
    }
  }, [])

  // Salvar features no localStorage
  useEffect(() => {
    localStorage.setItem("features", JSON.stringify(features))
  }, [features])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-500 hover:bg-red-600"
      case "Média":
        return "bg-amber-500 hover:bg-amber-600"
      case "Baixa":
        return "bg-green-500 hover:bg-green-600"
      default:
        return ""
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-green-500 hover:bg-green-600"
      case "Em Progresso":
        return "bg-blue-500 hover:bg-blue-600"
      case "Planejado":
        return "bg-gray-500 hover:bg-gray-600"
      default:
        return ""
    }
  }

  const handleAddFeature = () => {
    if (!newFeature.title) return

    if (isEditMode && currentFeatureId) {
      // Modo de edição
      const updatedFeatures = features.map((feature) =>
        feature.id === currentFeatureId ? { ...feature, ...newFeature } : feature,
      )
      setFeatures(updatedFeatures)
      toast({
        title: "Feature atualizada",
        description: "A feature foi atualizada com sucesso.",
      })
    } else {
      // Modo de adição
      const feature: Feature = {
        id: Date.now().toString(),
        ...newFeature,
      }
      setFeatures([...features, feature])
      toast({
        title: "Feature adicionada",
        description: "A nova feature foi adicionada com sucesso.",
      })
    }

    setIsDialogOpen(false)
    setIsEditMode(false)
    setCurrentFeatureId(null)
    setNewFeature({
      title: "",
      description: "",
      priority: "Média",
      status: "Planejado",
      type: "Core",
    })
  }

  const handleEditFeature = (feature: Feature) => {
    setIsEditMode(true)
    setCurrentFeatureId(feature.id)
    setNewFeature({
      title: feature.title,
      description: feature.description,
      priority: feature.priority,
      status: feature.status,
      type: feature.type,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteFeature = (featureId: string) => {
    setFeatureToDelete(featureId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteFeature = () => {
    if (!featureToDelete) return

    const updatedFeatures = features.filter((feature) => feature.id !== featureToDelete)
    setFeatures(updatedFeatures)
    setIsDeleteDialogOpen(false)
    setFeatureToDelete(null)
    toast({
      title: "Feature excluída",
      description: "A feature foi excluída com sucesso.",
    })
  }

  const filteredFeatures = features.filter((feature) => {
    const matchesSearch =
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(feature.status)
    const matchesType = typeFilter.length === 0 || typeFilter.includes(feature.type)
    const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(feature.priority)

    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar features..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["Planejado", "Em Progresso", "Concluído"].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, status])
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== status))
                    }
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Tipo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["Core", "UI/UX", "Performance", "Integração", "IA"].map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={typeFilter.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setTypeFilter([...typeFilter, type])
                    } else {
                      setTypeFilter(typeFilter.filter((t) => t !== type))
                    }
                  }}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Prioridade
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["Alta", "Média", "Baixa"].map((priority) => (
                <DropdownMenuCheckboxItem
                  key={priority}
                  checked={priorityFilter.includes(priority)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPriorityFilter([...priorityFilter, priority])
                    } else {
                      setPriorityFilter(priorityFilter.filter((p) => p !== priority))
                    }
                  }}
                >
                  {priority}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={() => {
              setIsEditMode(false)
              setCurrentFeatureId(null)
              setNewFeature({
                title: "",
                description: "",
                priority: "Média",
                status: "Planejado",
                type: "Core",
              })
              setIsDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Feature
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFeatures.map((feature) => (
          <Card key={feature.id} className="transition-all hover:shadow-md">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditFeature(feature)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteFeature(feature.id)} className="text-red-600">
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="mb-4 text-sm text-muted-foreground">{feature.description}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getStatusColor(feature.status)}>{feature.status}</Badge>
                <Badge className={getPriorityColor(feature.priority)}>{feature.priority}</Badge>
                <Badge variant="outline">{feature.type}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para adicionar/editar feature */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Feature" : "Adicionar Nova Feature"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newFeature.title}
                onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                placeholder="Título da feature"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                placeholder="Descrição da feature"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={newFeature.priority}
                onValueChange={(value) =>
                  setNewFeature({ ...newFeature, priority: value as "Baixa" | "Média" | "Alta" })
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newFeature.status}
                onValueChange={(value) =>
                  setNewFeature({ ...newFeature, status: value as "Planejado" | "Em Progresso" | "Concluído" })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planejado">Planejado</SelectItem>
                  <SelectItem value="Em Progresso">Em Progresso</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newFeature.type}
                onValueChange={(value) =>
                  setNewFeature({
                    ...newFeature,
                    type: value as "Core" | "UI/UX" | "Performance" | "Integração" | "IA",
                  })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core">Core</SelectItem>
                  <SelectItem value="UI/UX">UI/UX</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Integração">Integração</SelectItem>
                  <SelectItem value="IA">IA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddFeature}>
              {isEditMode ? "Salvar Alterações" : "Adicionar Feature"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir esta feature? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteFeature}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
