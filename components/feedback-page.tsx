"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, ThumbsUp, MessageSquare, Filter, Pencil } from "lucide-react"
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

type Feedback = {
  id: string
  title: string
  description: string
  votes: number
  comments: number
  status: "Novo" | "Em Análise" | "Planejado" | "Implementado" | "Fechado"
  type: "Bug" | "Sugestão" | "Pergunta"
  author: string
  createdAt: string
}

export function FeedbackPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentFeedbackId, setCurrentFeedbackId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null)

  const [newFeedback, setNewFeedback] = useState<Omit<Feedback, "id" | "votes" | "comments" | "createdAt">>({
    title: "",
    description: "",
    status: "Novo",
    type: "Sugestão",
    author: "",
  })

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: "1",
      title: "Editor trava com arquivos muito grandes",
      description: "Quando tento abrir arquivos com mais de 10.000 linhas, o editor fica lento e eventualmente trava.",
      votes: 38,
      comments: 12,
      status: "Em Análise",
      type: "Bug",
      author: "Carlos Mendes",
      createdAt: "2024-04-01T10:30:00Z",
    },
    {
      id: "2",
      title: "Adicionar suporte para TypeScript 5.0",
      description:
        "Seria ótimo ter suporte para as novas funcionalidades do TypeScript 5.0, especialmente os decorators.",
      votes: 27,
      comments: 5,
      status: "Planejado",
      type: "Sugestão",
      author: "Ana Silva",
      createdAt: "2024-04-02T14:15:00Z",
    },
    {
      id: "3",
      title: "Como configurar múltiplos modelos de IA?",
      description:
        "Estou tentando configurar diferentes modelos de IA para diferentes linguagens, mas não encontro essa opção. É possível?",
      votes: 15,
      comments: 8,
      status: "Novo",
      type: "Pergunta",
      author: "Mariana Oliveira",
      createdAt: "2024-04-03T09:45:00Z",
    },
    {
      id: "4",
      title: "Sugestões de IA não funcionam com Python",
      description:
        "As sugestões de código com IA funcionam bem com JavaScript, mas não aparecem quando estou editando arquivos Python.",
      votes: 32,
      comments: 7,
      status: "Em Análise",
      type: "Bug",
      author: "Pedro Santos",
      createdAt: "2024-04-04T16:20:00Z",
    },
    {
      id: "5",
      title: "Adicionar tema de alto contraste",
      description:
        "Seria útil ter um tema de alto contraste para melhorar a acessibilidade para usuários com deficiência visual.",
      votes: 21,
      comments: 3,
      status: "Implementado",
      type: "Sugestão",
      author: "Juliana Costa",
      createdAt: "2024-04-05T11:00:00Z",
    },
    {
      id: "6",
      title: "É possível usar o editor offline?",
      description: "Preciso usar o editor em ambientes sem acesso à internet. Existe alguma forma de usá-lo offline?",
      votes: 18,
      comments: 6,
      status: "Fechado",
      type: "Pergunta",
      author: "Lucas Ferreira",
      createdAt: "2024-04-06T15:30:00Z",
    },
  ])

  // Carregar feedbacks do localStorage
  useEffect(() => {
    const savedFeedbacks = localStorage.getItem("feedbacks")
    if (savedFeedbacks) {
      try {
        setFeedbacks(JSON.parse(savedFeedbacks))
      } catch (e) {
        console.error("Erro ao carregar feedbacks:", e)
      }
    }
  }, [])

  // Salvar feedbacks no localStorage
  useEffect(() => {
    localStorage.setItem("feedbacks", JSON.stringify(feedbacks))
  }, [feedbacks])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo":
        return "bg-blue-500 hover:bg-blue-600"
      case "Em Análise":
        return "bg-amber-500 hover:bg-amber-600"
      case "Planejado":
        return "bg-purple-500 hover:bg-purple-600"
      case "Implementado":
        return "bg-green-500 hover:bg-green-600"
      case "Fechado":
        return "bg-gray-500 hover:bg-gray-600"
      default:
        return ""
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Bug":
        return "bg-red-500 hover:bg-red-600"
      case "Sugestão":
        return "bg-green-500 hover:bg-green-600"
      case "Pergunta":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return ""
    }
  }

  const handleAddFeedback = () => {
    if (!newFeedback.title || !newFeedback.author) return

    if (isEditMode && currentFeedbackId) {
      // Modo de edição
      const updatedFeedbacks = feedbacks.map((feedback) => {
        if (feedback.id === currentFeedbackId) {
          return {
            ...feedback,
            title: newFeedback.title,
            description: newFeedback.description,
            status: newFeedback.status,
            type: newFeedback.type,
            author: newFeedback.author,
          }
        }
        return feedback
      })
      setFeedbacks(updatedFeedbacks)
      toast({
        title: "Feedback atualizado",
        description: "O feedback foi atualizado com sucesso.",
      })
    } else {
      // Modo de adição
      const feedback: Feedback = {
        id: Date.now().toString(),
        title: newFeedback.title,
        description: newFeedback.description,
        votes: 0,
        comments: 0,
        status: newFeedback.status,
        type: newFeedback.type,
        author: newFeedback.author,
        createdAt: new Date().toISOString(),
      }
      setFeedbacks([...feedbacks, feedback])
      toast({
        title: "Feedback adicionado",
        description: "O novo feedback foi adicionado com sucesso.",
      })
    }

    setIsDialogOpen(false)
    setIsEditMode(false)
    setCurrentFeedbackId(null)
    setNewFeedback({
      title: "",
      description: "",
      status: "Novo",
      type: "Sugestão",
      author: "",
    })
  }

  const handleEditFeedback = (feedback: Feedback) => {
    setIsEditMode(true)
    setCurrentFeedbackId(feedback.id)
    setNewFeedback({
      title: feedback.title,
      description: feedback.description,
      status: feedback.status,
      type: feedback.type,
      author: feedback.author,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteFeedback = (feedbackId: string) => {
    setFeedbackToDelete(feedbackId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteFeedback = () => {
    if (!feedbackToDelete) return

    const updatedFeedbacks = feedbacks.filter((feedback) => feedback.id !== feedbackToDelete)
    setFeedbacks(updatedFeedbacks)
    setIsDeleteDialogOpen(false)
    setFeedbackToDelete(null)
    toast({
      title: "Feedback excluído",
      description: "O feedback foi excluído com sucesso.",
    })
  }

  const handleVote = (feedbackId: string) => {
    const updatedFeedbacks = feedbacks.map((feedback) => {
      if (feedback.id === feedbackId) {
        return {
          ...feedback,
          votes: feedback.votes + 1,
        }
      }
      return feedback
    })
    setFeedbacks(updatedFeedbacks)
  }

  const filteredFeedbacks = feedbacks
    .filter((feedback) => {
      const matchesSearch =
        feedback.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feedback.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(feedback.status)

      const matchesType = typeFilter.length === 0 || typeFilter.includes(feedback.type)

      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => {
      if (sortBy === "votes") {
        return b.votes - a.votes
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const allStatuses = Array.from(new Set(feedbacks.map((feedback) => feedback.status))).sort()
  const allTypes = Array.from(new Set(feedbacks.map((feedback) => feedback.type))).sort()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar feedback..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allStatuses.map((status) => (
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
              {allTypes.map((type) => (
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
                Ordenar por: {sortBy === "votes" ? "Votos" : "Recentes"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem checked={sortBy === "votes"} onCheckedChange={() => setSortBy("votes")}>
                Votos
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={sortBy === "recent"} onCheckedChange={() => setSortBy("recent")}>
                Recentes
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={() => {
              setIsEditMode(false)
              setCurrentFeedbackId(null)
              setNewFeedback({
                title: "",
                description: "",
                status: "Novo",
                type: "Sugestão",
                author: "",
              })
              setIsDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Feedback
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFeedbacks.map((feedback) => (
          <Card key={feedback.id} className="transition-all hover:shadow-md">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{feedback.title}</CardTitle>
                <div className="flex items-center gap-1">
                  <Badge className={getTypeColor(feedback.type)}>{feedback.type}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditFeedback(feedback)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteFeedback(feedback.id)} className="text-red-600">
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="mb-4 text-sm text-muted-foreground">{feedback.description}</p>
              <Badge className={getStatusColor(feedback.status)}>{feedback.status}</Badge>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4 text-sm">
              <div className="text-xs text-muted-foreground">
                {feedback.author} • {formatDate(feedback.createdAt)}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" onClick={() => handleVote(feedback.id)}>
                  <ThumbsUp className="h-4 w-4" />
                  <span>{feedback.votes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{feedback.comments}</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Dialog para adicionar/editar feedback */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Feedback" : "Adicionar Novo Feedback"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newFeedback.title}
                onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                placeholder="Título do feedback"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newFeedback.description}
                onChange={(e) => setNewFeedback({ ...newFeedback, description: e.target.value })}
                placeholder="Descrição do feedback"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newFeedback.type}
                onValueChange={(value) =>
                  setNewFeedback({ ...newFeedback, type: value as "Bug" | "Sugestão" | "Pergunta" })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Sugestão">Sugestão</SelectItem>
                  <SelectItem value="Pergunta">Pergunta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newFeedback.status}
                onValueChange={(value) =>
                  setNewFeedback({
                    ...newFeedback,
                    status: value as "Novo" | "Em Análise" | "Planejado" | "Implementado" | "Fechado",
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Em Análise">Em Análise</SelectItem>
                  <SelectItem value="Planejado">Planejado</SelectItem>
                  <SelectItem value="Implementado">Implementado</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                value={newFeedback.author}
                onChange={(e) => setNewFeedback({ ...newFeedback, author: e.target.value })}
                placeholder="Nome do autor"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddFeedback}>
              {isEditMode ? "Salvar Alterações" : "Adicionar Feedback"}
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
            <p>Tem certeza que deseja excluir este feedback? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteFeedback}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
