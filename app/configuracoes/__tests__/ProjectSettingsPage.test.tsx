import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectSettingsPage } from '@/app/configuracoes/ProjectSettingsPage.client';
import { ThemeColorProvider } from '@/components/theme-color-provider';
import { useProjectCache } from '@/hooks/useProjectCache';
import { useToast } from '@/components/ui/use-toast';

// Mock dos hooks
jest.mock('@/hooks/useProjectCache');
jest.mock('@/components/ui/use-toast');

describe('ProjectSettingsPage', () => {
  const mockProject = {
    id: 'test-project-id',
    name: 'Test Project',
    description: 'Test Description',
    ownerId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useProjectCache as jest.Mock).mockReturnValue({
      project: mockProject,
      isLoading: false,
      error: null,
      updateProject: jest.fn(),
    });

    (useToast as jest.Mock).mockReturnValue({
      toast: jest.fn(),
    });
  });

  it('deve renderizar o componente corretamente', () => {
    render(
      <ThemeColorProvider>
        <ProjectSettingsPage />
      </ThemeColorProvider>
    );

    expect(screen.getByText('Configurações do Projeto')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do Projeto')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
    expect(screen.getByText('Salvar Alterações')).toBeInTheDocument();
  });
});
