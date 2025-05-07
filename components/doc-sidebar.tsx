import { useState } from 'react';
import { DocSection } from '@/types/documentation';
import { cn } from '@/lib/utils';
import {
  FolderIcon,
  FolderOpenIcon,
  FileIcon,
  PlusIcon,
  TrashIcon,
  FolderPlusIcon,
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DocSidebarProps {
  sections: DocSection[];
  activeSection: string;
  setActiveSection: (id: string) => void;
  isAdmin: boolean;
  onNewSection: (parentId?: string) => void;
  onNewFolder: (parentId?: string) => void;
  onDeleteSection: (id: string) => void;
  onMoveSection: (id: string, newParentId: string | null) => void;
}

export function DocSidebar({
  sections,
  activeSection,
  setActiveSection,
  isAdmin,
  onNewSection,
  onNewFolder,
  onDeleteSection,
  onMoveSection,
}: DocSidebarProps) {
  // Estado para controlar pastas expandidas
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Organizar seções em estrutura hierárquica
  const rootSections = sections.filter(s => !s.parentId);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 h-full overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Documentação</h2>

          {isAdmin && (
            <div className="flex space-x-1">
              <button
                onClick={() => onNewSection()}
                className="p-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                title="Novo documento"
              >
                <PlusIcon className="h-4 w-4" />
              </button>

              <button
                onClick={() => onNewFolder()}
                className="p-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                title="Nova pasta"
              >
                <FolderPlusIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1">
          {rootSections
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(section => (
              <SidebarItem
                key={section.id}
                section={section}
                sections={sections}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isAdmin={isAdmin}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                onDeleteSection={onDeleteSection}
                onNewSection={onNewSection}
                onNewFolder={onNewFolder}
                onMoveSection={onMoveSection}
                level={0}
              />
            ))}
        </div>
      </div>
    </DndProvider>
  );
}

interface SidebarItemProps {
  section: DocSection;
  sections: DocSection[];
  activeSection: string;
  setActiveSection: (id: string) => void;
  isAdmin: boolean;
  expandedFolders: Record<string, boolean>;
  toggleFolder: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onNewSection: (parentId?: string) => void;
  onNewFolder: (parentId?: string) => void;
  onMoveSection: (id: string, newParentId: string | null) => void;
  level: number;
}

function SidebarItem({
  section,
  sections,
  activeSection,
  setActiveSection,
  isAdmin,
  expandedFolders,
  toggleFolder,
  onDeleteSection,
  onNewSection,
  onNewFolder,
  onMoveSection,
  level,
}: SidebarItemProps) {
  // Configuração do drag-and-drop
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'DOC_ITEM',
    item: { id: section.id },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'DOC_ITEM',
    drop: (item: { id: string }) => {
      if (item.id !== section.id) {
        const targetId = section.isFolder ? section.id : section.parentId || null;
        onMoveSection(item.id, targetId);
      }
    },
    canDrop: item => item.id !== section.id,
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  // Encontrar filhos desta seção se for uma pasta
  const children = sections.filter(s => s.parentId === section.id);
  const isExpanded = expandedFolders[section.id];

  // Referência que combina drag e drop
  const itemRef = (el: HTMLDivElement) => {
    drag(el);
    drop(el);
  };

  return (
    <div>
      <div
        ref={itemRef}
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
          section.id === activeSection
            ? 'bg-zinc-800 text-white'
            : 'text-zinc-400 hover:text-white',
          isDragging && 'opacity-50',
          isOver && canDrop && 'bg-zinc-700 border border-dashed border-zinc-500',
          `ml-${level * 4}`
        )}
      >
        {section.isFolder ? (
          <button onClick={() => toggleFolder(section.id)} className="flex items-center flex-1">
            {isExpanded ? (
              <FolderOpenIcon className="h-4 w-4 mr-2 text-yellow-400" />
            ) : (
              <FolderIcon className="h-4 w-4 mr-2 text-yellow-400" />
            )}
            <span>{section.title}</span>
          </button>
        ) : (
          <div className="flex items-center flex-1" onClick={() => setActiveSection(section.id)}>
            <FileIcon className="h-4 w-4 mr-2 text-blue-400" />
            <span>{section.title}</span>
          </div>
        )}

        {isAdmin && (
          <div className="flex items-center">
            {section.isFolder && (
              <div className="flex space-x-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onNewSection(section.id);
                  }}
                  className="p-0.5 rounded-full hover:bg-zinc-700"
                  title="Novo documento nesta pasta"
                >
                  <PlusIcon className="h-3 w-3" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onNewFolder(section.id);
                  }}
                  className="p-0.5 rounded-full hover:bg-zinc-700"
                  title="Nova pasta dentro desta"
                >
                  <FolderPlusIcon className="h-3 w-3" />
                </button>
              </div>
            )}
            <button
              onClick={e => {
                e.stopPropagation();
                onDeleteSection(section.id);
              }}
              className="p-0.5 rounded-full hover:bg-zinc-700"
              title="Remover"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {section.isFolder && isExpanded && (
        <div className="pl-2">
          {children
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(child => (
              <SidebarItem
                key={child.id}
                section={child}
                sections={sections}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isAdmin={isAdmin}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                onDeleteSection={onDeleteSection}
                onNewSection={onNewSection}
                onNewFolder={onNewFolder}
                onMoveSection={onMoveSection}
                level={level + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}
