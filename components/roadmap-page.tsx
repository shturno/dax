'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjectContext } from '@/context/ProjectContext';

type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: 'Planejado' | 'Em Progresso' | 'Concluído';
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: string;
};

export function RoadmapPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<Omit<RoadmapItem, 'id'>>({
    title: '',
    description: '',
    status: 'Planejado',
    quarter: 'Q1',
    year: '2024',
  });

  const { projectId } = useProjectContext();
  const [items, setItems] = useState<RoadmapItem[]>([]);

  // Carregar roadmap do localStorage
  useEffect(() => {
    if (!projectId) return;
    const saved = localStorage.getItem(`roadmap-${projectId}`);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar roadmap:', e);
      }
    }
  }, [projectId]);

  // Salvar roadmap no localStorage
  useEffect(() => {
    if (!projectId) return;
    localStorage.setItem(`roadmap-${projectId}`, JSON.stringify(items));
  }, [items, projectId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-500 hover:bg-green-600';
      case 'Em Progresso':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'Planejado':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return '';
    }
  };

  const handleAddItem = () => {
    if (!newItem.title) return;

    if (isEditMode && currentItemId) {
      // Modo de edição
      const updatedItems = items.map(item =>
        item.id === currentItemId ? { ...item, ...newItem } : item
      );
      setItems(updatedItems);
      toast({
        title: 'Item atualizado',
        description: 'O item do roadmap foi atualizado com sucesso.',
      });
    } else {
      // Modo de adição
      const item: RoadmapItem = {
        id: Date.now().toString(),
        ...newItem,
      };
      setItems([...items, item]);
      toast({
        title: 'Item adicionado',
        description: 'O novo item foi adicionado ao roadmap com sucesso.',
      });
    }

    setIsDialogOpen(false);
    setIsEditMode(false);
    setCurrentItemId(null);
    setNewItem({
      title: '',
      description: '',
      status: 'Planejado',
      quarter: 'Q1',
      year: '2024',
    });
  };

  const handleEditItem = (item: RoadmapItem) => {
    setIsEditMode(true);
    setCurrentItemId(item.id);
    setNewItem({
      title: item.title,
      description: item.description,
      status: item.status,
      quarter: item.quarter,
      year: item.year,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;

    const updatedItems = items.filter(item => item.id !== itemToDelete);
    setItems(updatedItems);
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
    toast({
      title: 'Item excluído',
      description: 'O item foi removido do roadmap com sucesso.',
    });
  };

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const years = Array.from(new Set(items.map(item => item.year))).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Roadmap do Projeto</h2>
        <Button
          size="sm"
          onClick={() => {
            setIsEditMode(false);
            setCurrentItemId(null);
            setNewItem({
              title: '',
              description: '',
              status: 'Planejado',
              quarter: 'Q1',
              year: '2024',
            });
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Item
        </Button>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="quarters">Trimestres</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <div className="relative space-y-8 before:absolute before:inset-0 before:left-9 before:ml-0.5 before:border-l-2 before:border-dashed before:border-muted-foreground/20">
            {items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="relative mt-3 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <div className="h-2.5 w-2.5 rounded-full bg-current" />
                </div>
                <div className="flex-grow">
                  <Card data-testid="roadmap-card">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {item.quarter} {item.year}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600"
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quarters" className="mt-4">
          {years.map(year => (
            <div key={year} className="mb-8">
              <h3 className="mb-4 text-xl font-bold">{year}</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {quarters.map(quarter => (
                  <Card key={quarter} data-testid="roadmap-card" className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">{quarter}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {items
                        .filter(item => item.quarter === quarter && item.year === year)
                        .map(item => (
                          <div key={item.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{item.title}</h4>
                              <div className="flex items-center gap-1">
                                <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="text-red-600"
                                    >
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar/editar item */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Item do Roadmap' : 'Adicionar Novo Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Título do item"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Descrição do item"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newItem.status}
                onValueChange={value =>
                  setNewItem({
                    ...newItem,
                    status: value as 'Planejado' | 'Em Progresso' | 'Concluído',
                  })
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quarter">Trimestre</Label>
                <Select
                  value={newItem.quarter}
                  onValueChange={value =>
                    setNewItem({ ...newItem, quarter: value as 'Q1' | 'Q2' | 'Q3' | 'Q4' })
                  }
                >
                  <SelectTrigger id="quarter">
                    <SelectValue placeholder="Trimestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Ano</Label>
                <Select
                  value={newItem.year}
                  onValueChange={value => setNewItem({ ...newItem, year: value })}
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddItem}>
              {isEditMode ? 'Salvar Alterações' : 'Adicionar Item'}
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
            <p>
              Tem certeza que deseja excluir este item do roadmap? Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteItem}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
