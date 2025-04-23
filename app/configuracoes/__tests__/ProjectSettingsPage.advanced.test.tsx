import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectSettingsPage } from '@/app/configuracoes/ProjectSettingsPage.client';
import { ThemeColorProvider } from '@/components/theme-color-provider';
import { useProjectCache } from '@/hooks/useProjectCache';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useThemeColor } from '@/components/theme-color-provider';
import { logger } from '@/utils/logger';

// Mock the hooks and modules
jest.mock('@/hooks/useProjectCache', () => ({
  __esModule: true,
  useProjectCache: jest.fn()
}));

jest.mock('@/components/ui/use-toast', () => ({
  __esModule: true,
  useToast: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: jest.fn()
}));

jest.mock('next-themes', () => ({
  __esModule: true,
  useTheme: jest.fn()
}));

jest.mock('@/components/theme-color-provider', () => ({
  __esModule: true,
  useThemeColor: jest.fn(),
  ThemeColorProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('ProjectSettingsPage Advanced Tests', () => {
  const mockProject = {
    _id: 'test-project-id',
    name: 'Test Project',
    description: 'Test Description',
    ownerId: 'test-user-id',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  const mockToast = jest.fn();
  const mockUpdateProject = jest.fn();
  const mockFetchProject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useSession
    (useSession as jest.Mock).mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Test User', email: 'test@example.com' } }
    });

    // Mock useTheme
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: jest.fn()
    });

    // Mock useThemeColor
    (useThemeColor as jest.Mock).mockReturnValue({
      color: 'default',
      setColor: jest.fn(),
      ready: true
    });

    // Mock useToast
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast
    });
  });

  test('deve mostrar o estado de carregamento', () => {
    (useProjectCache as jest.Mock).mockReturnValue({
      fetchProject: mockFetchProject,
      updateProject: mockUpdateProject,
      isLoading: true,
      error: null
    });

    render(<ProjectSettingsPage />);
    
    // Verificar se o spinner de carregamento está presente
    const loadingElement = screen.getByTestId('loading-spinner');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('deve carregar e exibir os dados do projeto corretamente', async () => {
    mockFetchProject.mockResolvedValue(mockProject);
    
    (useProjectCache as jest.Mock).mockReturnValue({
      fetchProject: mockFetchProject,
      updateProject: mockUpdateProject,
      isLoading: false,
      error: null
    });

    render(<ProjectSettingsPage />);
    
    // Verificar se o fetchProject foi chamado com 'current'
    expect(mockFetchProject).toHaveBeenCalledWith('current');
    
    // Aguardar o preenchimento dos campos
    await waitFor(() => {
      expect(screen.getByLabelText('Nome do Projeto')).toHaveValue(mockProject.name);
      expect(screen.getByLabelText('Descrição')).toHaveValue(mockProject.description);
    });
  });

  test('deve exibir mensagem de erro quando falhar ao carregar o projeto', async () => {
    const mockError = new Error('Erro ao carregar projeto');
    mockFetchProject.mockRejectedValue(mockError);
    
    (useProjectCache as jest.Mock).mockReturnValue({
      fetchProject: mockFetchProject,
      updateProject: mockUpdateProject,
      isLoading: false,
      error: mockError
    });

    render(<ProjectSettingsPage />);
    
    // Verificar se o fetchProject foi chamado
    expect(mockFetchProject).toHaveBeenCalledWith('current');
    
    // Verificar se o toast de erro foi chamado
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Erro',
        variant: 'destructive'
      }));
    });
  });

  test('deve validar o formulário e mostrar erros', async () => {
    mockFetchProject.mockResolvedValue(mockProject);
    
    (useProjectCache as jest.Mock).mockReturnValue({
      fetchProject: mockFetchProject,
      updateProject: mockUpdateProject,
      isLoading: false,
      error: null
    });

    render(<ProjectSettingsPage />);
    
    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(screen.getByLabelText('Nome do Projeto')).toHaveValue(mockProject.name);
    });
    
    // Limpar o campo de nome
    fireEvent.change(screen.getByLabelText('Nome do Projeto'), { target: { value: '' } });
    
    // Tentar salvar
    fireEvent.click(screen.getByText('Salvar Alterações'));
    
    // Verificar se a mensagem de erro aparece
    await waitFor(() => {
      expect(screen.getByText('Nome do projeto é obrigatório')).toBeInTheDocument();
    });
    
    // Verificar que updateProject não foi chamado
    expect(mockUpdateProject).not.toHaveBeenCalled();
  });

  test('deve validar nome do projeto com menos de 3 caracteres', async () => {
    mockFetchProject.mockResolvedValue(mockProject);
    
    (useProjectCache as jest.Mock).mockReturnValue({
      fetchProject: mockFetchProject,
      updateProject: mockUpdateProject,
      isLoading: false,
      error: null
    });

    render(<ProjectSettingsPage />);
    
    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(screen.getByLabelText('Nome do Projeto')).toHaveValue(mockProject.name);
    });
    
    // Definir um nome muito curto
    fireEvent.change(screen.getByLabelText('Nome do Projeto'), { target: { value: 'AB' } });
    
    // Tentar salvar
    fireEvent.click(screen.getByText('Salvar Alterações'));
    
    // Verificar se a mensagem de erro aparece
    await waitFor(() => {
      expect(screen.getByText('Nome do projeto deve ter pelo menos 3 caracteres')).toBeInTheDocument();
    });
    
    // Verificar que updateProject não foi chamado
    expect(mockUpdateProject).not.toHaveBeenCalled();
  });

  test('deve salvar as alterações do projeto com sucesso', async () => {
    mockFetchProject.mockResolvedValue(mockProject);
    
    const updatedProject = {
      ...mockProject,
      name: 'Projeto Atualizado',
      description: 'Descrição Atualizada'
    };
    
    mockUpdateProject.mockResolvedValue(updatedProject);
    
    (useProjectCache as jest.Mock).mockReturnValue({
      fetchProject: mockFetchProject,
      updateProject: mockUpdateProject,
      isLoading: false,
      error: null
    });

    render(<ProjectSettingsPage />);
    
    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(screen.getByLabelText('Nome do Projeto')).toHaveValue(mockProject.name);
    });
    
    // Atualizar os campos
    fireEvent.change(screen.getByLabelText('Nome do Projeto'), { target: { value: 'Projeto Atualizado' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Descrição Atualizada' } });
    
    // Salvar as alterações
    fireEvent.click(screen.getByText('Salvar Alterações'));
    
    // Verificar se updateProject foi chamado com os valores corretos
    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalledWith(
        mockProject._id,
        {
          name: 'Projeto Atualizado',
          description: 'Descrição Atualizada'
        }
      );
    });
    
    // Verificar se o toast de sucesso foi chamado
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Projeto atualizado',
      description: 'Nome e descrição salvos com sucesso.'
    }));
  });

  test('deve mostrar erro quando falhar ao salvar o projeto', async () => {
    mockFetchProject.mockResolvedValue(mockProject);
    
    const mockError = new Error('Erro ao salvar projeto');
    mockUpdateProject.mockRejectedValue(mockError);
    
    (useProjectCache as jest.Mock).mockReturnValue({
      fetchProject: mockFetchProject,
      updateProject: mockUpdateProject,
      isLoading: false,
      error: null
    });

    render(<ProjectSettingsPage />);
    
    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(screen.getByLabelText('Nome do Projeto')).toHaveValue(mockProject.name);
    });
    
    // Atualizar os campos
    fireEvent.change(screen.getByLabelText('Nome do Projeto'), { target: { value: 'Projeto Atualizado' } });
    
    // Salvar as alterações
    fireEvent.click(screen.getByText('Salvar Alterações'));
    
    // Verificar se o toast de erro foi chamado
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Erro ao salvar',
        variant: 'destructive'
      }));
    });
  });

  test('deve verificar autenticação antes de salvar', async () => {
    // Primeiro carregamos com usuário autenticado para inicializar o componente
    (useSession as jest.Mock).mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Test User', email: 'test@example.com' } }
    });
    
    mockFetchProject.mockResolvedValue(mockProject);
    
    (useProjectCache as jest.Mock).mockReturnValue({
      fetchProject: mockFetchProject,
      updateProject: mockUpdateProject,
      isLoading: false,
      error: null
    });

    const { rerender } = render(<ProjectSettingsPage />);
    
    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(mockFetchProject).toHaveBeenCalled();
    });

    // Agora mudamos para usuário não autenticado
    (useSession as jest.Mock).mockReturnValue({
      status: 'unauthenticated',
      data: null
    });

    // Re-renderizar o componente
    rerender(<ProjectSettingsPage />);
    
    // Simular preenchimento de campos
    fireEvent.change(screen.getByLabelText('Nome do Projeto'), { target: { value: 'Novo Nome' } });
    
    // Tentar salvar as alterações
    fireEvent.click(screen.getByText('Salvar Alterações'));
    
    // Verificar se o toast de erro de autenticação foi chamado
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Não autenticado',
        description: 'Faça login para salvar.',
        variant: 'destructive'
      }));
    });
    
    // Verificar que updateProject não foi chamado
    expect(mockUpdateProject).not.toHaveBeenCalled();
  });

  test('deve lidar com o caso de nenhum projeto selecionado', async () => {
    // Configurar para retornar null ao buscar o projeto
    mockFetchProject.mockResolvedValue(null);
    
    (useProjectCache as jest.Mock).mockReturnValue({
      fetchProject: mockFetchProject,
      updateProject: mockUpdateProject,
      isLoading: false,
      error: null
    });

    render(<ProjectSettingsPage />);
    
    // Verificar se o toast de erro foi chamado
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Erro',
        description: 'Nenhum projeto encontrado. Por favor, crie um projeto primeiro.',
        variant: 'destructive'
      }));
    });
  });
});
