'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Save,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Arquitetura do Editor',
      content:
        '# Arquitetura do Editor\n\nO editor será construído usando um modelo de componentes modular para facilitar extensões.\n\n## Componentes Principais\n\n- **Core Editor**: Responsável pela edição de texto e manipulação de arquivos\n- **Plugin System**: Framework para extensões de terceiros\n- **UI Layer**: Interface do usuário customizável\n\n## Tecnologias\n\n- React/Next.js para a interface\n- Monaco Editor como base para o editor de código\n- WebAssembly para componentes de alta performance',
      createdAt: '2024-04-01T10:30:00Z',
      updatedAt: '2024-04-02T14:15:00Z',
    },
    {
      id: '2',
      title: 'Integração com IA',
      content:
        '# Integração com IA\n\nA integração com IA será um diferencial importante do editor.\n\n## Funcionalidades Planejadas\n\n- Autocompletion contextual\n- Sugestões de refatoração\n- Explicação de código\n- Geração de documentação\n\n## Modelos de IA\n\nPrecisamos avaliar diferentes modelos para cada funcionalidade:\n\n1. Modelos locais para tarefas simples (menor latência)\n2. Modelos em nuvem para tarefas complexas (maior qualidade)',
      createdAt: '2024-04-03T09:45:00Z',
      updatedAt: '2024-04-03T16:20:00Z',
    },
    {
      id: '3',
      title: 'Roadmap de Desenvolvimento',
      content:
        '# Roadmap de Desenvolvimento\n\n## Q1 2024\n- MVP do editor com funcionalidades básicas\n- Integração inicial com IA para autocompletion\n\n## Q2 2024\n- Sistema de extensões\n- Colaboração em tempo real\n\n## Q3 2024\n- Integração com GitHub e outros serviços\n- Depuração integrada\n\n## Q4 2024\n- Marketplace de extensões\n- Versão mobile',
      createdAt: '2024-04-05T11:00:00Z',
      updatedAt: '2024-04-05T11:00:00Z',
    },
    {
      id: '4',
      title: 'Ideias para UX',
      content:
        '# Ideias para UX\n\n## Princípios de Design\n\n- Minimalista mas poderoso\n- Customizável para diferentes fluxos de trabalho\n- Acessível para todos os usuários\n\n## Inspirações\n\n- VSCode: Para funcionalidades e extensibilidade\n- Notion: Para simplicidade e estética\n- Cursor: Para integração com IA\n\n## Temas\n\n- Tema claro/escuro automático baseado nas preferências do sistema\n- Temas de alta contraste para acessibilidade\n- Temas personalizáveis pelo usuário',
      createdAt: '2024-04-06T15:30:00Z',
      updatedAt: '2024-04-07T10:45:00Z',
    },
  ]);

  // Carregar notas do localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Erro ao carregar notas:', e);
      }
    }
  }, []);

  // Salvar notas no localStorage
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nova Nota',
      content: '# Nova Nota\n\nComece a escrever aqui...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    toast({
      title: 'Nota criada',
      description: 'Uma nova nota foi criada com sucesso.',
    });
  };

  const handleSaveNote = () => {
    if (!selectedNote) return;

    const updatedNotes = notes.map(note =>
      note.id === selectedNote.id ? { ...selectedNote, updatedAt: new Date().toISOString() } : note
    );

    setNotes(updatedNotes);
    toast({
      title: 'Nota salva',
      description: 'Suas alterações foram salvas com sucesso.',
    });
  };

  const handleDeleteNote = () => {
    if (!selectedNote) return;

    const updatedNotes = notes.filter(note => note.id !== selectedNote.id);
    setNotes(updatedNotes);
    setSelectedNote(null);
    setIsDeleteDialogOpen(false);
    toast({
      title: 'Nota excluída',
      description: 'A nota foi excluída com sucesso.',
    });
  };

  const applyFormatting = (format: string) => {
    if (!selectedNote) return;

    const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = selectedNote.content.substring(start, end);
    let formattedText = '';
    let cursorPosition = 0;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorPosition = 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorPosition = 1;
        break;
      case 'list':
        formattedText = selectedText
          .split('\n')
          .map(line => `- ${line}`)
          .join('\n');
        cursorPosition = 2;
        break;
      case 'ordered-list':
        formattedText = selectedText
          .split('\n')
          .map((line, i) => `${i + 1}. ${line}`)
          .join('\n');
        cursorPosition = 3;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        cursorPosition = 1;
        break;
      case 'image':
        formattedText = `![${selectedText}](url)`;
        cursorPosition = 2;
        break;
      default:
        return;
    }

    const newContent =
      selectedNote.content.substring(0, start) +
      formattedText +
      selectedNote.content.substring(end);

    setSelectedNote({
      ...selectedNote,
      content: newContent,
    });

    // Reposicionar o cursor após a formatação
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorPosition,
        end + formattedText.length - selectedText.length - cursorPosition
      );
    }, 0);
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-1">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar notas..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleCreateNote}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Nota
          </Button>
        </div>

        <div className="space-y-2 overflow-auto pr-2" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          {filteredNotes.map(note => (
            <Card
              key={note.id}
              data-testid="note-card"
              className={`cursor-pointer transition-all hover:shadow-md ${selectedNote?.id === note.id ? 'border-primary' : ''}`}
              onClick={() => setSelectedNote(note)}
            >
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">{note.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {note.content
                    .replace(/#{1,6}\s[^\n]+/g, '')
                    .replace(/\n/g, ' ')
                    .trim()}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Atualizado em {formatDate(note.updatedAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        {selectedNote ? (
          <Card className="h-full">
            <CardHeader className="border-b p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={selectedNote.title}
                  onChange={e => setSelectedNote({ ...selectedNote, title: e.target.value })}
                  className="text-lg font-semibold"
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => applyFormatting('bold')}>
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyFormatting('italic')}>
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyFormatting('list')}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyFormatting('ordered-list')}>
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyFormatting('link')}>
                  <Link className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyFormatting('image')}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveNote}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <textarea
                id="note-content"
                value={selectedNote.content}
                onChange={e => setSelectedNote({ ...selectedNote, content: e.target.value })}
                className="h-[calc(100vh-16rem)] w-full resize-none border-0 bg-background p-4 font-mono text-sm focus:outline-none"
              />
            </CardContent>
            <CardFooter className="border-t p-2 text-xs text-muted-foreground">
              <div>
                Criado em {formatDate(selectedNote.createdAt)} • Atualizado em{' '}
                {formatDate(selectedNote.updatedAt)}
              </div>
            </CardFooter>
          </Card>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium">Nenhuma nota selecionada</h3>
              <p className="text-muted-foreground">
                Selecione uma nota para editar ou crie uma nova
              </p>
              <Button className="mt-4" onClick={handleCreateNote}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Nota
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteNote}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
