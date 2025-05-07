'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ThumbsUp, MessageSquare, Filter, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useProjectContext } from '@/context/ProjectContext';

type Idea = {
  id: string;
  title: string;
  description: string;
  votes: number;
  comments: number;
  tags: string[];
  author: string;
  createdAt: string;
};

export function IdeasPage() {
  const { projectId } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentIdeaId, setCurrentIdeaId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  const [newIdea, setNewIdea] = useState<Omit<Idea, 'id' | 'votes' | 'comments' | 'createdAt'>>({
    title: '',
    description: '',
    tags: [],
    author: '',
  });

  const [ideas, setIdeas] = useState<Idea[]>([]);

  // Carregar ideias do localStorage
  useEffect(() => {
    if (!projectId) return;
    const saved = localStorage.getItem(`ideas-${projectId}`);
    if (saved) {
      try {
        setIdeas(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar ideias:', e);
      }
    }
  }, [projectId]);

  // Salvar ideias no localStorage
  useEffect(() => {
    if (!projectId) return;
    localStorage.setItem(`ideas-${projectId}`, JSON.stringify(ideas));
  }, [ideas, projectId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const handleAddIdea = () => {
    if (!newIdea.title || !newIdea.author) return;

    if (isEditMode && currentIdeaId) {
      // Modo de edição
      const updatedIdeas = ideas.map(idea => {
        if (idea.id === currentIdeaId) {
          return {
            ...idea,
            title: newIdea.title,
            description: newIdea.description,
            tags: newIdea.tags,
            author: newIdea.author,
          };
        }
        return idea;
      });
      setIdeas(updatedIdeas);
      toast({
        title: 'Ideia atualizada',
        description: 'A ideia foi atualizada com sucesso.',
      });
    } else {
      // Modo de adição
      const idea: Idea = {
        id: Date.now().toString(),
        title: newIdea.title,
        description: newIdea.description,
        votes: 0,
        comments: 0,
        tags: newIdea.tags,
        author: newIdea.author,
        createdAt: new Date().toISOString(),
      };
      setIdeas([...ideas, idea]);
      toast({
        title: 'Ideia adicionada',
        description: 'A nova ideia foi adicionada com sucesso.',
      });
    }

    setIsDialogOpen(false);
    setIsEditMode(false);
    setCurrentIdeaId(null);
    setNewIdea({
      title: '',
      description: '',
      tags: [],
      author: '',
    });
    setNewTag('');
  };

  const handleEditIdea = (idea: Idea) => {
    setIsEditMode(true);
    setCurrentIdeaId(idea.id);
    setNewIdea({
      title: idea.title,
      description: idea.description,
      tags: [...idea.tags],
      author: idea.author,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteIdea = (ideaId: string) => {
    setIdeaToDelete(ideaId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteIdea = () => {
    if (!ideaToDelete) return;

    const updatedIdeas = ideas.filter(idea => idea.id !== ideaToDelete);
    setIdeas(updatedIdeas);
    setIsDeleteDialogOpen(false);
    setIdeaToDelete(null);
    toast({
      title: 'Ideia excluída',
      description: 'A ideia foi excluída com sucesso.',
    });
  };

  const handleAddTag = () => {
    if (!newTag) return;
    if (!newIdea.tags.includes(newTag)) {
      setNewIdea({
        ...newIdea,
        tags: [...newIdea.tags, newTag],
      });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewIdea({
      ...newIdea,
      tags: newIdea.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleVote = (ideaId: string) => {
    const updatedIdeas = ideas.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          votes: idea.votes + 1,
        };
      }
      return idea;
    });
    setIdeas(updatedIdeas);
  };

  const filteredIdeas = ideas
    .filter(idea => {
      const matchesSearch =
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags = tagFilter.length === 0 || idea.tags.some(tag => tagFilter.includes(tag));

      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      if (sortBy === 'votes') {
        return b.votes - a.votes;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const allTags = Array.from(new Set(ideas.flatMap(idea => idea.tags))).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ideias..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Tags
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allTags.map(tag => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={tagFilter.includes(tag)}
                  onCheckedChange={checked => {
                    if (checked) {
                      setTagFilter([...tagFilter, tag]);
                    } else {
                      setTagFilter(tagFilter.filter(t => t !== tag));
                    }
                  }}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Ordenar por: {sortBy === 'votes' ? 'Votos' : 'Recentes'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={sortBy === 'votes'}
                onCheckedChange={() => setSortBy('votes')}
              >
                Votos
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'recent'}
                onCheckedChange={() => setSortBy('recent')}
              >
                Recentes
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={() => {
              setIsEditMode(false);
              setCurrentIdeaId(null);
              setNewIdea({
                title: '',
                description: '',
                tags: [],
                author: '',
              });
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Ideia
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIdeas.map(idea => (
          <Card key={idea.id} className="transition-all hover:shadow-md">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{idea.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditIdea(idea)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteIdea(idea.id)}
                      className="text-red-600"
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="mb-4 text-sm text-muted-foreground">{idea.description}</p>
              <div className="flex flex-wrap gap-1">
                {idea.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4 text-sm">
              <div className="text-xs text-muted-foreground">
                {idea.author} • {formatDate(idea.createdAt)}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 px-2"
                  onClick={() => handleVote(idea.id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{idea.votes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{idea.comments}</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Dialog para adicionar/editar ideia */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Ideia' : 'Adicionar Nova Ideia'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newIdea.title}
                onChange={e => setNewIdea({ ...newIdea, title: e.target.value })}
                placeholder="Título da ideia"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newIdea.description}
                onChange={e => setNewIdea({ ...newIdea, description: e.target.value })}
                placeholder="Descrição da ideia"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                value={newIdea.author}
                onChange={e => setNewIdea({ ...newIdea, author: e.target.value })}
                placeholder="Nome do autor"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="Adicionar tag"
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {newIdea.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <span className="sr-only">Remover</span>
                      <span>×</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddIdea}>
              {isEditMode ? 'Salvar Alterações' : 'Adicionar Ideia'}
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
            <p>Tem certeza que deseja excluir esta ideia? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteIdea}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
