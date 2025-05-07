'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search,
  ChevronRight,
  File,
  FolderOpen,
  Folder,
  Plus,
  Pencil,
  Save,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DocItem = {
  id: string;
  title: string;
  type: 'folder' | 'file';
  content?: string;
  children?: DocItem[];
  parentId?: string;
};

export function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['1']);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DocItem | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [newItem, setNewItem] = useState<Omit<DocItem, 'id'>>({
    title: '',
    type: 'file',
    content: '',
    parentId: '1',
  });

  const [docs, setDocs] = useState<DocItem[]>([
    {
      id: '1',
      title: 'Documentação',
      type: 'folder',
      children: [
        {
          id: '2',
          title: 'Guia de Início Rápido',
          type: 'file',
          content:
            "# Guia de Início Rápido\n\nBem-vindo ao AI Editor! Este guia ajudará você a começar a usar nosso editor rapidamente.\n\n## Instalação\n\n```bash\nnpm install ai-editor\n```\n\n## Uso Básico\n\n```javascript\nimport { AIEditor } from 'ai-editor';\n\nfunction App() {\n  return <AIEditor />;\n}\n```\n\n## Próximos Passos\n\n- Explore as [funcionalidades avançadas](#)\n- Veja nossos [tutoriais em vídeo](#)\n- Junte-se à nossa [comunidade](#)",
          parentId: '1',
        },
        {
          id: '3',
          title: 'Tutoriais',
          type: 'folder',
          parentId: '1',
          children: [
            {
              id: '4',
              title: 'Usando o Editor Básico',
              type: 'file',
              parentId: '3',
              content:
                '# Usando o Editor Básico\n\nEste tutorial cobre as funcionalidades básicas do editor.\n\n## Interface do Usuário\n\nA interface do editor é dividida em várias seções:\n\n- **Barra de Ferramentas**: Contém ações comuns como salvar, desfazer, refazer\n- **Editor Principal**: Área onde você edita seu código\n- **Painel Lateral**: Contém explorador de arquivos, extensões e outras ferramentas\n- **Barra de Status**: Mostra informações como tipo de arquivo, posição do cursor\n\n## Atalhos de Teclado\n\n| Atalho | Ação |\n|--------|------|\n| Ctrl+S | Salvar |\n| Ctrl+Z | Desfazer |\n| Ctrl+Y | Refazer |\n| Ctrl+F | Buscar |\n| Ctrl+H | Substituir |',
            },
            {
              id: '5',
              title: 'Integração com IA',
              type: 'file',
              parentId: '3',
              content:
                '# Integração com IA\n\nEste tutorial explica como usar as funcionalidades de IA do editor.\n\n## Autocompletion\n\nO editor oferece sugestões de código inteligentes enquanto você digita. Para usar:\n\n1. Comece a digitar código\n2. Quando aparecerem sugestões, use as setas para navegar\n3. Pressione Tab ou Enter para aceitar uma sugestão\n\n## Explicação de Código\n\nPara obter uma explicação de um trecho de código:\n\n1. Selecione o código\n2. Clique com o botão direito\n3. Escolha "Explicar Código"\n\n## Geração de Código\n\nPara gerar código a partir de uma descrição:\n\n1. Pressione Ctrl+Shift+G\n2. Digite uma descrição do que você quer gerar\n3. Pressione Enter',
            },
          ],
        },
        {
          id: '6',
          title: 'Referência da API',
          type: 'file',
          parentId: '1',
          content:
            "# Referência da API\n\n## Componentes Principais\n\n### AIEditor\n\n```typescript\ninterface AIEditorProps {\n  initialValue?: string;\n  language?: string;\n  theme?: 'light' | 'dark';\n  onChange?: (value: string) => void;\n  aiProvider?: AIProvider;\n}\n\nfunction AIEditor(props: AIEditorProps): JSX.Element;\n```\n\n### AIProvider\n\n```typescript\ninterface AIProvider {\n  getCompletions: (context: string) => Promise<string[]>;\n  explainCode: (code: string) => Promise<string>;\n  generateCode: (description: string) => Promise<string>;\n}\n```\n\n## Hooks\n\n### useAIEditor\n\n```typescript\nfunction useAIEditor(): {\n  value: string;\n  setValue: (value: string) => void;\n  getCompletions: () => Promise<string[]>;\n  explainSelection: () => Promise<string>;\n  generateFromDescription: (description: string) => Promise<string>;\n};\n```",
        },
        {
          id: '7',
          title: 'Extensões',
          type: 'folder',
          parentId: '1',
          children: [
            {
              id: '8',
              title: 'Criando Extensões',
              type: 'file',
              parentId: '7',
              content:
                "# Criando Extensões\n\nEste guia explica como criar extensões para o AI Editor.\n\n## Estrutura Básica\n\n```typescript\nimport { Extension } from 'ai-editor';\n\nconst myExtension: Extension = {\n  name: 'my-extension',\n  activate: (context) => {\n    // Código de inicialização\n    return {\n      dispose: () => {\n        // Limpeza quando a extensão for desativada\n      }\n    };\n  }\n};\n\nexport default myExtension;\n```\n\n## API de Extensões\n\nAs extensões têm acesso a várias APIs:\n\n- **Editor API**: Manipular o conteúdo do editor\n- **UI API**: Adicionar elementos à interface\n- **Filesystem API**: Acessar arquivos\n- **AI API**: Utilizar recursos de IA\n\n## Publicando Extensões\n\nPara publicar sua extensão:\n\n1. Crie um pacote npm\n2. Adicione 'ai-editor-extension' como palavra-chave\n3. Publique no npm\n4. Envie para o nosso marketplace",
            },
            {
              id: '9',
              title: 'Extensões Populares',
              type: 'file',
              parentId: '7',
              content:
                '# Extensões Populares\n\n## Temas\n\n- **Dark Pro**: Tema escuro inspirado no VS Code\n- **Monokai**: Tema colorido clássico\n- **GitHub Light**: Tema claro inspirado no GitHub\n\n## Produtividade\n\n- **Code Snippets**: Biblioteca de snippets para várias linguagens\n- **Git Integration**: Integração avançada com Git\n- **Project Manager**: Gerenciamento de múltiplos projetos\n\n## IA Avançada\n\n- **AI Test Generator**: Gera testes automaticamente\n- **Code Reviewer**: Revisa seu código e sugere melhorias\n- **Documentation Generator**: Gera documentação a partir do código',
            },
          ],
        },
      ],
    },
  ]);

  // Carregar documentação do localStorage
  useEffect(() => {
    const savedDocs = localStorage.getItem('documentation');
    if (savedDocs) {
      try {
        setDocs(JSON.parse(savedDocs));
      } catch (e) {
        console.error('Erro ao carregar documentação:', e);
      }
    }
  }, []);

  // Salvar documentação no localStorage
  useEffect(() => {
    localStorage.setItem('documentation', JSON.stringify(docs));
  }, [docs]);

  // Atualizar o conteúdo editado quando o documento selecionado muda
  useEffect(() => {
    if (selectedDoc) {
      setEditedContent(selectedDoc.content || '');
    }
  }, [selectedDoc]);

  const toggleFolder = (id: string) => {
    if (expandedFolders.includes(id)) {
      setExpandedFolders(expandedFolders.filter(folderId => folderId !== id));
    } else {
      setExpandedFolders([...expandedFolders, id]);
    }
  };

  const renderDocTree = (items: DocItem[], level = 0) => {
    return items.map(item => (
      <div key={item.id} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-sm hover:bg-accent ${
            selectedDoc?.id === item.id ? 'bg-accent' : ''
          }`}
        >
          <div
            className="flex-1 flex items-center gap-2"
            onClick={() => {
              if (item.type === 'folder') {
                toggleFolder(item.id);
              } else {
                setSelectedDoc(item);
              }
            }}
          >
            {item.type === 'folder' ? (
              <>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${expandedFolders.includes(item.id) ? 'rotate-90' : ''}`}
                />
                {expandedFolders.includes(item.id) ? (
                  <FolderOpen className="h-4 w-4 text-amber-500" />
                ) : (
                  <Folder className="h-4 w-4 text-amber-500" />
                )}
              </>
            ) : (
              <>
                <div className="w-4" />
                <File className="h-4 w-4 text-blue-500" />
              </>
            )}
            <span>{item.title}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                <Pencil className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditItem(item)}>Renomear</DropdownMenuItem>
              {item.type === 'folder' && (
                <DropdownMenuItem onClick={() => handleAddNewItem(item.id, 'file')}>
                  Adicionar Arquivo
                </DropdownMenuItem>
              )}
              {item.type === 'folder' && (
                <DropdownMenuItem onClick={() => handleAddNewItem(item.id, 'folder')}>
                  Adicionar Pasta
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleDeleteItem(item)} className="text-red-600">
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {item.children &&
          expandedFolders.includes(item.id) &&
          renderDocTree(item.children, level + 1)}
      </div>
    ));
  };

  const findDocItem = (items: DocItem[], id: string): DocItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findDocItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const findAllDocItems = (items: DocItem[]): DocItem[] => {
    let result: DocItem[] = [];
    for (const item of items) {
      if (item.type === 'file') result.push(item);
      if (item.children) {
        result = [...result, ...findAllDocItems(item.children)];
      }
    }
    return result;
  };

  const handleSaveContent = () => {
    if (!selectedDoc) return;

    // Função recursiva para atualizar o documento
    const updateDocContent = (items: DocItem[]): DocItem[] => {
      return items.map(item => {
        if (item.id === selectedDoc.id) {
          return { ...item, content: editedContent };
        }
        if (item.children) {
          return { ...item, children: updateDocContent(item.children) };
        }
        return item;
      });
    };

    const updatedDocs = updateDocContent(docs);
    setDocs(updatedDocs);

    // Atualizar o documento selecionado
    setSelectedDoc({ ...selectedDoc, content: editedContent });

    toast({
      title: 'Documento salvo',
      description: 'O conteúdo do documento foi salvo com sucesso.',
    });
  };

  const handleEditItem = (item: DocItem) => {
    setIsEditMode(true);
    setNewItem({
      title: item.title,
      type: item.type,
      content: item.content || '',
      parentId: item.parentId,
    });
    setCurrentEditingId(item.id);
    setIsDialogOpen(true);
  };

  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);

  const handleAddNewItem = (parentId: string, type: 'file' | 'folder') => {
    setIsEditMode(false);
    setNewItem({
      title: type === 'file' ? 'Novo Arquivo' : 'Nova Pasta',
      type: type,
      content: type === 'file' ? '# Novo Documento\n\nComece a escrever aqui...' : undefined,
      parentId: parentId,
    });
    setCurrentEditingId(null);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (item: DocItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;

    // Função recursiva para remover o item
    const removeItem = (items: DocItem[]): DocItem[] => {
      return items
        .filter(item => item.id !== itemToDelete.id)
        .map(item => {
          if (item.children) {
            return { ...item, children: removeItem(item.children) };
          }
          return item;
        });
    };

    const updatedDocs = removeItem(docs);
    setDocs(updatedDocs);

    // Se o item excluído for o selecionado, limpar a seleção
    if (selectedDoc && selectedDoc.id === itemToDelete.id) {
      setSelectedDoc(null);
    }

    setIsDeleteDialogOpen(false);
    setItemToDelete(null);

    toast({
      title: 'Item excluído',
      description: `${itemToDelete.type === 'file' ? 'Arquivo' : 'Pasta'} excluído com sucesso.`,
    });
  };

  const handleSaveItem = () => {
    if (!newItem.title) return;

    if (isEditMode && currentEditingId) {
      // Função recursiva para atualizar o item
      const updateItem = (items: DocItem[]): DocItem[] => {
        return items.map(item => {
          if (item.id === currentEditingId) {
            return { ...item, title: newItem.title };
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) };
          }
          return item;
        });
      };

      const updatedDocs = updateItem(docs);
      setDocs(updatedDocs);

      // Atualizar o documento selecionado se for o que está sendo editado
      if (selectedDoc && selectedDoc.id === currentEditingId) {
        setSelectedDoc({ ...selectedDoc, title: newItem.title });
      }

      toast({
        title: 'Item atualizado',
        description: 'O item foi renomeado com sucesso.',
      });
    } else {
      // Adicionar novo item
      const newId = Date.now().toString();
      const newDocItem: DocItem = {
        id: newId,
        title: newItem.title,
        type: newItem.type,
        content: newItem.type === 'file' ? newItem.content : undefined,
        children: newItem.type === 'folder' ? [] : undefined,
        parentId: newItem.parentId,
      };

      // Função recursiva para adicionar o item ao pai correto
      const addItemToParent = (items: DocItem[]): DocItem[] => {
        return items.map(item => {
          if (item.id === newItem.parentId) {
            return {
              ...item,
              children: [...(item.children || []), newDocItem],
            };
          }
          if (item.children) {
            return { ...item, children: addItemToParent(item.children) };
          }
          return item;
        });
      };

      const updatedDocs = addItemToParent(docs);
      setDocs(updatedDocs);

      // Expandir a pasta pai
      if (newItem.parentId && !expandedFolders.includes(newItem.parentId)) {
        setExpandedFolders([...expandedFolders, newItem.parentId]);
      }

      toast({
        title: 'Item adicionado',
        description: `Novo ${newItem.type === 'file' ? 'arquivo' : 'pasta'} adicionado com sucesso.`,
      });
    }

    setIsDialogOpen(false);
    setNewItem({
      title: '',
      type: 'file',
      content: '',
      parentId: '1',
    });
    setCurrentEditingId(null);
  };

  const allDocs = findAllDocItems(docs);
  const filteredDocs = searchQuery
    ? allDocs.filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-1">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar documentação..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={() => handleAddNewItem('1', 'file')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Arquivo
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleAddNewItem('1', 'folder')}>
            <Folder className="mr-2 h-4 w-4" />
            Nova Pasta
          </Button>
        </div>

        <div className="overflow-auto pr-2" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          {searchQuery ? (
            <div className="space-y-1">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-sm hover:bg-accent ${
                    selectedDoc?.id === doc.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <File className="h-4 w-4 text-blue-500" />
                  <span>{doc.title}</span>
                </div>
              ))}
            </div>
          ) : (
            renderDocTree(docs)
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        {selectedDoc ? (
          <Card className="h-full overflow-auto">
            <CardHeader className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <CardTitle>{selectedDoc.title}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveContent}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteItem(selectedDoc)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                className="h-[calc(100vh-16rem)] w-full resize-none border-0 bg-background p-4 font-mono text-sm focus:outline-none"
              />
            </CardContent>
            <CardFooter className="border-t p-2 text-xs text-muted-foreground">
              <div>Dica: Use a sintaxe Markdown para formatar o documento</div>
            </CardFooter>
          </Card>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium">Selecione um documento</h3>
              <p className="text-muted-foreground">
                Escolha um documento da lista para visualizar seu conteúdo
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button onClick={() => handleAddNewItem('1', 'file')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Arquivo
                </Button>
                <Button variant="outline" onClick={() => handleAddNewItem('1', 'folder')}>
                  <Folder className="mr-2 h-4 w-4" />
                  Nova Pasta
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog para adicionar/editar item */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? 'Renomear Item'
                : `Adicionar ${newItem.type === 'file' ? 'Arquivo' : 'Pasta'}`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                placeholder={`Título do ${newItem.type === 'file' ? 'arquivo' : 'pasta'}`}
              />
            </div>
            {!isEditMode && newItem.type === 'file' && (
              <div className="grid gap-2">
                <Label htmlFor="content">Conteúdo Inicial</Label>
                <Textarea
                  id="content"
                  value={newItem.content}
                  onChange={e => setNewItem({ ...newItem, content: e.target.value })}
                  placeholder="Conteúdo inicial do documento"
                  rows={5}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveItem}>
              {isEditMode ? 'Salvar Alterações' : 'Adicionar'}
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
              Tem certeza que deseja excluir{' '}
              {itemToDelete?.type === 'folder' ? 'esta pasta' : 'este arquivo'}?
              {itemToDelete?.type === 'folder' &&
                ' Todos os arquivos dentro desta pasta também serão excluídos.'}
              Esta ação não pode ser desfeita.
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
