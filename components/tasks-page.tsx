'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

type Task = {
  id: string;
  title: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  assignee: string;
  tags: string[];
};

type Column = {
  id: 'todo' | 'doing' | 'done';
  title: string;
  tasks: Task[];
};

export function TasksPage() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'A Fazer',
      tasks: [
        {
          id: '1',
          title: 'Implementar suporte a extensões',
          description: 'Criar sistema de plugins para extensibilidade',
          priority: 'Alta',
          assignee: 'Ana Silva',
          tags: ['Feature', 'Arquitetura'],
        },
        {
          id: '2',
          title: 'Adicionar temas personalizáveis',
          description: 'Permitir que usuários criem e compartilhem temas',
          priority: 'Baixa',
          assignee: 'Carlos Mendes',
          tags: ['UI', 'UX'],
        },
      ],
    },
    {
      id: 'doing',
      title: 'Em Andamento',
      tasks: [
        {
          id: '4',
          title: 'Melhorar performance do editor',
          description: 'Otimizar renderização para arquivos grandes',
          priority: 'Média',
          assignee: 'Pedro Santos',
          tags: ['Performance', 'Core'],
        },
      ],
    },
    {
      id: 'done',
      title: 'Concluído',
      tasks: [
        {
          id: '6',
          title: 'Setup inicial do projeto',
          description: 'Configurar estrutura base do editor',
          priority: 'Alta',
          assignee: 'Lucas Ferreira',
          tags: ['Infraestrutura'],
        },
      ],
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [currentColumnId, setCurrentColumnId] = useState<'todo' | 'doing' | 'done'>('todo');
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    priority: 'Média',
    assignee: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; columnId: string } | null>(null);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedColumns = localStorage.getItem('tasks');
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch (e) {
        console.error('Erro ao carregar tarefas:', e);
      }
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(columns));
  }, [columns]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-500 hover:bg-red-600';
      case 'Média':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'Baixa':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return '';
    }
  };

  const handleAddTask = () => {
    if (!newTask.title) return;

    if (isEditMode && currentTaskId) {
      // Modo de edição
      const updatedColumns = columns.map(column => {
        const taskIndex = column.tasks.findIndex(task => task.id === currentTaskId);
        if (taskIndex !== -1) {
          const updatedTasks = [...column.tasks];
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            ...newTask,
          };
          return {
            ...column,
            tasks: updatedTasks,
          };
        }
        return column;
      });
      setColumns(updatedColumns);
      toast({
        title: 'Tarefa atualizada',
        description: 'A tarefa foi atualizada com sucesso.',
      });
    } else {
      // Modo de adição
      const updatedColumns = columns.map(column => {
        if (column.id === currentColumnId) {
          return {
            ...column,
            tasks: [
              ...column.tasks,
              {
                id: Date.now().toString(),
                ...newTask,
              },
            ],
          };
        }
        return column;
      });
      setColumns(updatedColumns);
      toast({
        title: 'Tarefa adicionada',
        description: 'A nova tarefa foi adicionada com sucesso.',
      });
    }

    setIsDialogOpen(false);
    setIsEditMode(false);
    setCurrentTaskId(null);
    setNewTask({
      title: '',
      description: '',
      priority: 'Média',
      assignee: '',
      tags: [],
    });
    setNewTag('');
  };

  const handleEditTask = (task: Task, columnId: string) => {
    setIsEditMode(true);
    setCurrentTaskId(task.id);
    setCurrentColumnId(columnId as 'todo' | 'doing' | 'done');
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee: task.assignee,
      tags: [...task.tags],
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
    setTaskToDelete({ id: taskId, columnId });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;

    const updatedColumns = columns.map(column => {
      if (column.id === taskToDelete.columnId) {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskToDelete.id),
        };
      }
      return column;
    });

    setColumns(updatedColumns);
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
    toast({
      title: 'Tarefa excluída',
      description: 'A tarefa foi excluída com sucesso.',
    });
  };

  const handleAddTag = () => {
    if (!newTag) return;
    setNewTask({
      ...newTask,
      tags: [...newTask.tags, newTag],
    });
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTask({
      ...newTask,
      tags: newTask.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleMoveTask = (taskId: string, fromColumn: string, toColumn: string) => {
    if (fromColumn === toColumn) return;

    const updatedColumns = [...columns];
    const fromColumnIndex = updatedColumns.findIndex(col => col.id === fromColumn);
    const toColumnIndex = updatedColumns.findIndex(col => col.id === toColumn);

    if (fromColumnIndex === -1 || toColumnIndex === -1) return;

    const taskIndex = updatedColumns[fromColumnIndex].tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    const task = updatedColumns[fromColumnIndex].tasks[taskIndex];

    // Remover da coluna original
    updatedColumns[fromColumnIndex].tasks.splice(taskIndex, 1);

    // Adicionar à nova coluna
    updatedColumns[toColumnIndex].tasks.push(task);

    setColumns(updatedColumns);
    toast({
      title: 'Tarefa movida',
      description: `A tarefa foi movida para ${updatedColumns[toColumnIndex].title}.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Quadro de Tarefas</h2>
        <Button
          size="sm"
          onClick={() => {
            setIsEditMode(false);
            setCurrentTaskId(null);
            setNewTask({
              title: '',
              description: '',
              priority: 'Média',
              assignee: '',
              tags: [],
            });
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {columns.map(column => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{column.title}</h3>
              <Badge variant="outline">{column.tasks.length}</Badge>
            </div>
            <div className="space-y-4">
              {column.tasks.map(task => (
                <Card key={task.id} className="cursor-pointer transition-all hover:shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTask(task, column.id)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTask(task.id, column.id)}
                              className="text-red-600"
                              aria-label="Excluir"
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardDescription className="text-xs">{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          Responsável: {task.assignee}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Botões para mover a tarefa */}
                    <div className="mt-3 flex justify-end gap-1">
                      {column.id !== 'todo' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveTask(task.id, column.id, 'todo')}
                          aria-label="Mover"
                        >
                          ← A Fazer
                        </Button>
                      )}
                      {column.id !== 'doing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveTask(task.id, column.id, 'doing')}
                          aria-label="Mover"
                        >
                          {column.id === 'todo' ? '→' : '←'} Em Andamento
                        </Button>
                      )}
                      {column.id !== 'done' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveTask(task.id, column.id, 'done')}
                          aria-label="Mover"
                        >
                          Concluído →
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
                onClick={() => {
                  setIsEditMode(false);
                  setCurrentTaskId(null);
                  setNewTask({
                    title: '',
                    description: '',
                    priority: 'Média',
                    assignee: '',
                    tags: [],
                  });
                  setCurrentColumnId(column.id);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar tarefa
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog para adicionar/editar tarefa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Título da tarefa"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Descrição da tarefa"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={newTask.priority}
                onValueChange={value =>
                  setNewTask({ ...newTask, priority: value as 'Baixa' | 'Média' | 'Alta' })
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
              <Label htmlFor="assignee">Responsável</Label>
              <Input
                id="assignee"
                value={newTask.assignee}
                onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                placeholder="Nome do responsável"
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
                {newTask.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
            {!isEditMode && (
              <div className="grid gap-2">
                <Label htmlFor="column">Coluna</Label>
                <Select
                  value={currentColumnId}
                  onValueChange={value => setCurrentColumnId(value as 'todo' | 'doing' | 'done')}
                >
                  <SelectTrigger id="column">
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">A Fazer</SelectItem>
                    <SelectItem value="doing">Em Andamento</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddTask} aria-label="Salvar">
              {isEditMode ? 'Salvar Alterações' : 'Adicionar Tarefa'}
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
            <p>Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTask} aria-label="Excluir">
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
